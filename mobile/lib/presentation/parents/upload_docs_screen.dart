import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class UploadDocsScreen extends StatefulWidget {
  final String alunoId;

  const UploadDocsScreen({super.key, required this.alunoId});

  @override
  State<UploadDocsScreen> createState() => _UploadDocsScreenState();
}

class _UploadDocsScreenState extends State<UploadDocsScreen> {
  final ImagePicker _picker = ImagePicker();
  final SupabaseClient _supabaseClient = Supabase.instance.client;

  File? _declaracaoMatricula;
  File? _comprovanteResidencia;
  bool _isUploading = false;

  Future<void> _pickImage(bool isDeclaracao) async {
    final XFile? image = await _picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 80,
    );

    if (image != null) {
      setState(() {
        if (isDeclaracao) {
          _declaracaoMatricula = File(image.path);
        } else {
          _comprovanteResidencia = File(image.path);
        }
      });
    }
  }

  Future<void> _uploadDocument(File file, String docType) async {
    final fileName = '${widget.alunoId}_${docType}_${DateTime.now().millisecondsSinceEpoch}.jpg';
    final storagePath = 'documentos/$fileName';

    // Upload do arquivo para a Storage bucket 'documentos_aluno'
    await _supabaseClient.storage.from('documentos_aluno').upload(
          storagePath,
          file,
          fileOptions: const FileOptions(cacheControl: '3600', upsert: true),
        );

    // Salvar registro na tabela 'documentos_aluno'
    final fileUrl = _supabaseClient.storage.from('documentos_aluno').getPublicUrl(storagePath);
    await _supabaseClient.from('documentos_aluno').insert({
      'aluno_id': widget.alunoId,
      'tipo_documento': docType,
      'url_documento': fileUrl,
    });
  }

  Future<void> _submitDocuments() async {
    if (_declaracaoMatricula == null || _comprovanteResidencia == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor, envie ambos os documentos.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() {
      _isUploading = true;
    });

    try {
      await _uploadDocument(_declaracaoMatricula!, 'DeclaracaoMatricula');
      await _uploadDocument(_comprovanteResidencia!, 'ComprovanteResidencia');

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Documentos enviados com sucesso!'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro no envio de documentos: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isUploading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Envio de Documentos'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Documentação Necessária',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Color(0xFF0F2042),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Por favor, tire uma foto legível dos seguintes documentos originais para aprovação do cadastro do transporte escolar.',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 32),

            // Card 1: Declaração de Matrícula
            _buildDocCard(
              title: 'Declaração de Matrícula',
              file: _declaracaoMatricula,
              onTap: () => _pickImage(true),
            ),

            const SizedBox(height: 20),

            // Card 2: Comprovante de Residência
            _buildDocCard(
              title: 'Comprovante de Residência',
              file: _comprovanteResidencia,
              onTap: () => _pickImage(false),
            ),

            const SizedBox(height: 40),

            _isUploading
                ? const Center(child: CircularProgressIndicator())
                : ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0F2042),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: _submitDocuments,
                    child: const Text(
                      'Enviar Documentos',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
          ],
        ),
      ),
    );
  }

  Widget _buildDocCard({
    required String title,
    required File? file,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          border: Border.all(
            color: file != null ? Colors.green : const Color(0xFF0F2042).withOpacity(0.3),
            width: 2,
          ),
          borderRadius: BorderRadius.circular(16),
          color: file != null ? Colors.green.withOpacity(0.05) : Colors.transparent,
        ),
        child: Row(
          children: [
            Icon(
              file != null ? Icons.check_circle : Icons.camera_alt,
              color: file != null ? Colors.green : const Color(0xFF0F2042),
              size: 40,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: Color(0xFF0F2042),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    file != null ? 'Foto Capturada' : 'Toque para tirar foto',
                    style: TextStyle(
                      color: file != null ? Colors.green : Colors.grey,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
