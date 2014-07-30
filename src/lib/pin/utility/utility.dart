part of pin;

class PinUtility {

  static void setCwdToRoot([String relative = '']) {
    String root = LibPath.join(LibPath.dirname(Platform.script.toFilePath()), relative);

    PinLogger.instance.fine('[PinUtility] Set Directory.current to: $root');

    Directory.current = root;
  }

}