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

  static void _printLogRecord(LogRecord r) {
    print("${r.loggerName} ${r.level} ${r.message}");
  }

}