import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'presentation/driver/driver_scanner_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Inicializa o banco de dados local Offline (Hive)
  await Hive.initFlutter();
  await Hive.openBox('logs_embarque'); // Box para logs offline de embarque

  // 2. Inicializa o cliente do Supabase
  // Substitua as credenciais de URL e AnonKey conforme a sua necessidade do app
  await Supabase.initialize(
    url: 'https://lzzxivzkwtwifgvexuiy.supabase.co',
    anonKey: 'sb_publishable_Gh5TkPZtml0CvBRaiP_g8w_9nqhz8ED',
  );

  runApp(const RotaEscolaApp());
}

class RotaEscolaApp extends StatelessWidget {
  const RotaEscolaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RotaEscola Arapongas',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F2042), // Azul Marinho
          primary: const Color(0xFF0F2042),
          onPrimary: Colors.white,
          background: Colors.white,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0F2042),
          foregroundColor: Colors.white,
          elevation: 0,
        ),
      ),
      home: const DriverScannerScreen(),
    );
  }
}
