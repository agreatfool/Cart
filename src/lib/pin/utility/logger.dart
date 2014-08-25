part of pin;

class PinLogger {

  static Logger _logger;

  static Logger get instance {
    if (_logger == null) {
      _logger = Logger.root;
      _logger.level = Level.FINE;
      _logger.onRecord.listen(_printLogRecord);
    }

    return _logger;
  }

  void set level(Level value) {
    _logger.level = value;
  }

  static void _printLogRecord(LogRecord r) {
    print(_formatLogRecord(r));
  }

  static String _formatLogRecord(LogRecord r) {
    return "[${r.time}][${r.level}]: ${r.message}";
  }

}