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

  static Future<File> writeJsonFile(String path, Object json) {
    final completer = new Completer();
    String jsonStr = '';

    try {
      jsonStr = JSON.encode(json);
    } catch (e) {
      PinLogger.instance.shout('[PinUtility] writeJsonFile: Error in encoding JSON obj: {$json}');
      completer.complete(null);
    }

    (new File(path)).writeAsString(jsonStr).then((_) {
      completer.complete(_);
    });

    return completer.future;
  }

  static bool isUuid(String uuid) {
    return (new RegExp(r'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\$')).hasMatch(uuid);
  }

  static dynamic serialize(dynamic obj) {
    var result;

    if (obj is int || obj is String || obj is double || obj == null) {
      // input is simple value
      result = obj;
    } else if (obj is List) {
      // input is List
      result = new List();
      obj.forEach((element) {
        result.add(serialize(element));
      });
    } else if (obj is Map) {
      // input is Map
      result = new Map();
      obj.forEach((key, val) {
        result[key] = serialize(val);
      });
    } else {
      // input is Class
      result = new Map();
      InstanceMirror instanceMirror = reflect(obj);
      ClassMirror classMirror = instanceMirror.type;
      Iterable<DeclarationMirror> declarations = classMirror.declarations.values.where((declarationMirror) {
        return declarationMirror is VariableMirror;
      });
      declarations.forEach((DeclarationMirror declarationMirror) {
        var key = MirrorSystem.getName(declarationMirror.simpleName);
        var val = serialize(instanceMirror.getField(declarationMirror.simpleName).reflectee);
        result.addAll({ key: val });
      });
    }

    return result;
  }

  static String getVariableTypeName(dynamic obj) {
    String result;

    if (obj == null) {
      result = 'null';
    } else if (obj is int) {
      result = 'int';
    } else if (obj is String) {
      result = 'String';
    } else if (obj is double) {
      result = 'double';
    } else {
      result = MirrorSystem.getName(reflect(obj).type.simpleName);
    }

    return result;

  }

}