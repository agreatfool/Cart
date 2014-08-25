part of pin;

class PinUtility {

  static void setCwdToRoot([String relative = '']) {
    String root = LibPath.join(LibPath.dirname(Platform.script.toFilePath()), relative);

    PinLogger.instance.fine('[PinUtility] Set Directory.current to: $root');

    Directory.current = root;
  }

  static void validate(bool condition, String message) {
    if (condition) {
      return;
    }
    throw new FormatException('Wrong format: {$message}.');
  }

  static Object readJsonFileSync(String path) {
    Object data;

    File file = new File(path);
    String fileContent = '';

    if (file.existsSync()) {
      fileContent = new File(path).readAsStringSync();
    } else {
      PinLogger.instance.warning('[PinUtility] readJsonFileSync: Target file does not exist or is not file: {$path}');
    }

    if (fileContent.isNotEmpty) {
      try {
        data = JSON.decode(fileContent);
      } catch (e) {
        PinLogger.instance.shout('[PinUtility] readJsonFileSync: Error in JSON parsing file: {$path}, content: {$fileContent}');
      }
    }

    return data;
  }

  static Future writeJsonFile(String path, Object json) {
    String jsonStr = '';

    try {
      jsonStr = JSON.encode(json);
    } catch (e) {
      PinLogger.instance.shout('[PinUtility] writeJsonFile: Error in encoding JSON obj: {$json}');
      return new Future(null);
    }

    File file = new File(path);
    return file.writeAsString(jsonStr);
  }

}