part of pin;

class PinLogger {

  static Logger _logger;
  static File _file;

  static Logger get instance {
    if (_logger == null) {
      int now = PinTime.getTime();
      _file = new File('logs/system-${now}.log');
      _logger = Logger.root;
      _logger.level = Level.FINE;
      _logger.onRecord.listen(_printLogRecord);
      _logger.onRecord.listen(_fileLogRecord);
    }

    return _logger;
  }

  void set level(Level value) {
    _logger.level = value;
  }

  static void _printLogRecord(LogRecord r) {
    print(_formatLogRecord(r));
  }

  static void _fileLogRecord(LogRecord r) {
    _file
    .writeAsString(_formatLogRecord(r) + '\n', mode: FileMode.APPEND)
    .catchError((e, trace) {
      print('Error: ${e}');
      if (trace != null) {
        print('StackTrace: ${trace}');
      }
    });
  }

  static String _formatLogRecord(LogRecord r) {
    return "[${r.time}][${r.level}]: ${r.message}";
  }

}