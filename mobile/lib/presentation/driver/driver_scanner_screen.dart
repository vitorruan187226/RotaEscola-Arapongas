import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:hive/hive.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:uuid/uuid.dart';

class DriverScannerScreen extends StatefulWidget {
  const DriverScannerScreen({super.key});

  @override
  State<DriverScannerScreen> createState() => _DriverScannerScreenState();
}

class _DriverScannerScreenState extends State<DriverScannerScreen> {
  final MobileScannerController _scannerController = MobileScannerController();
  final SupabaseClient _supabaseClient = Supabase.instance.client;
  final _uuid = const Uuid();

  String _statusMessage = 'Aproxime o QR Code da Carteirinha';
  Color _statusColor = const Color(0xFF0F2042);
  bool _isProcessing = false;
  bool _isOnline = true;

  @override
  void initState() {
    super.initState();
    _checkInitialConnectivity();
    _monitorConnectivity();
  }

  Future<void> _checkInitialConnectivity() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    setState(() {
      _isOnline = !connectivityResult.contains(ConnectivityResult.none);
    });
    if (_isOnline) {
      _syncOfflineLogs();
    }
  }

  void _monitorConnectivity() {
    Connectivity().onConnectivityChanged.listen((results) {
      final online = !results.contains(ConnectivityResult.none);
      if (online != _isOnline) {
        setState(() {
          _isOnline = online;
        });
        if (online) {
          _syncOfflineLogs();
        }
      }
    });
  }

  Future<void> _syncOfflineLogs() async {
    final box = Hive.box('logs_embarque');
    if (box.isEmpty) return;

    final keys = List.from(box.keys);
    for (var key in keys) {
      final log = box.get(key) as Map;
      try {
        await _supabaseClient.from('logs_embarque').insert({
          'id': log['id'],
          'carteirinha_hash': log['carteirinha_hash'],
          'data_hora': log['data_hora'],
          'status_autorizacao': log['status_autorizacao'],
          'sincronizado': true,
        });
        await box.delete(key);
      } catch (_) {
        // Falha silenciosa: tenta sincronizar novamente no próximo ciclo
      }
    }
  }

  Future<void> _validateQrCode(String hash) async {
    if (_isProcessing) return;
    setState(() {
      _isProcessing = true;
      _statusMessage = 'Validando...';
      _statusColor = Colors.orange;
    });

    String status = 'Carteirinha Inválida';
    bool isValid = false;

    if (_isOnline) {
      try {
        final data = await _supabaseClient
            .from('carteirinhas')
            .select('ativa')
            .eq('qr_code_hash', hash)
            .maybeSingle();

        if (data != null && data['ativa'] == true) {
          isValid = true;
          status = 'Embarque Autorizado';
        }
      } catch (e) {
        // Tratar erro do RLS ou conexão instável
        status = 'Erro na validação remota';
      }
    } else {
      // Modo Offline: Salvamento local com autorização assumida provisoriamente
      // (Ou validação contra lista local se baixada previamente)
      isValid = true;
      status = 'Embarque Autorizado (Offline)';
    }

    // Registrar log
    final logId = _uuid.v4();
    final logData = {
      'id': logId,
      'carteirinha_hash': hash,
      'data_hora': DateTime.now().toIso8601String(),
      'status_autorizacao': status,
    };

    if (_isOnline && isValid) {
      try {
        await _supabaseClient.from('logs_embarque').insert({
          ...logData,
          'sincronizado': true,
        });
      } catch (_) {
        // Se falhar ao salvar log remoto, salva localmente para sync posterior
        final box = Hive.box('logs_embarque');
        await box.put(logId, logData);
      }
    } else {
      final box = Hive.box('logs_embarque');
      await box.put(logId, logData);
    }

    setState(() {
      _statusMessage = status;
      _statusColor = isValid ? Colors.green : Colors.red;
    });

    await Future.delayed(const Duration(seconds: 3));

    if (mounted) {
      setState(() {
        _statusMessage = 'Aproxime o QR Code da Carteirinha';
        _statusColor = const Color(0xFF0F2042);
        _isProcessing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Validador de Embarque - Motorista'),
        actions: [
          Icon(
            _isOnline ? Icons.wifi : Icons.wifi_off,
            color: _isOnline ? Colors.green : Colors.red,
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            flex: 4,
            child: Stack(
              alignment: Alignment.center,
              children: [
                MobileScanner(
                  controller: _scannerController,
                  onDetect: (capture) {
                    final List<Barcode> barcodes = capture.barcodes;
                    for (final barcode in barcodes) {
                      if (barcode.rawValue != null) {
                        _validateQrCode(barcode.rawValue!);
                        break;
                      }
                    }
                  },
                ),
                Container(
                  width: 250,
                  height: 250,
                  decoration: BoxDecoration(
                    border: Border.all(color: _statusColor, width: 4),
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            flex: 2,
            child: Container(
              width: double.infinity,
              color: Colors.white,
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: _statusColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      _statusMessage,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: _statusColor,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _scannerController.dispose();
    super.dispose();
  }
}
