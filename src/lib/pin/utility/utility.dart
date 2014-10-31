part of pin;

class PinUtility {

  static void setCwdToRoot([String relative = '']) {
    String root = LibPath.join(LibPath.dirname(Platform.script.toFilePath()), relative);

    PinLogger.instance.fine('[PinUtility] Set "Directory.current" to: ${root}');

    Directory.current = root;
  }

  static void validate(bool condition, String message) {
    if (condition) {
      return;
    }
    throw new FormatException('Wrong format: ${message}.');
  }

  static HashMap readJsonFileSync(String path) {
    HashMap data = new HashMap();

    File file = new File(path);
    String fileContent = '';

    if (file.existsSync()) {
      try {
        fileContent = new File(path).readAsStringSync();
      } catch (e, trace) {
        handleError(e, trace);
      }
    } else {
      PinLogger.instance.warning('[PinUtility] readJsonFileSync: Target file does not exist or is not file: ${path}');
    }

    if (fileContent.isNotEmpty) {
      try {
        data = JSON.decode(fileContent);
      } catch (e, trace) {
        handleError(e, trace, message: '[PinUtility] readJsonFileSync: Error in JSON parsing file: ${path}, content: ${fileContent}');
      }
    }

    return data;
  }

  static Future<File> writeJsonFile(String path, Map json, {withIndent: false}) {
    final completer = new Completer();
    String jsonStr = '';

    try {
      if (!withIndent) {
        jsonStr = JSON.encode(json);
      } else {
        final decoder = new JsonEncoder.withIndent('    ');
        jsonStr = decoder.convert(json);
      }
    } catch (e, trace) {
      handleError(e, trace, message: '[PinUtility] writeJsonFile: Error in encoding JSON obj: ${json}');
      completer.completeError(e, trace);
    }

    (new File(path)).writeAsString(jsonStr)
    .then((_) {
      completer.complete(_);
    })
    .catchError((e, trace) {
      handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

  static bool isUuid(String uuid) {
    if (!(uuid is String)) {
      return false;
    }
    return (new RegExp(r'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}')).hasMatch(uuid);
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

  static dynamic getObjVariableValue(dynamic obj, String variableName) {
    var value = null;

    try {
      InstanceMirror fieldMirror = reflect(obj).getField(new Symbol(variableName));
      value = fieldMirror.reflectee;
    } catch (e, trace) {
      handleError(e, trace);
      throw e;
    }

    return value;
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

  static bool checkDirExistsSync(String path, {bool createWhenNotExist: false}) {
    bool result = false;
    Directory dir = new Directory(path);

    if (!dir.existsSync() && createWhenNotExist) {
      try {
        dir.createSync(recursive: true);
        result = true;
      } catch(e, trace) {
        handleError(e, trace, message: '[PinUtility] checkDirExistsSync: Create dir failed: ${path} with Exception: ${e}');
      }
    } else {
      result = true;
    }

    return result;
  }

  static Future<bool> createDir(String path) {
    final completer = new Completer();
    Directory dir = new Directory(path);

    dir.exists().then((bool exists) {
      if (exists) {
        completer.complete(true);
      } else {
        dir.create(recursive: true)
        .then((_) {
          completer.complete(true);
        })
        .catchError((e, trace) {
          handleError(e, trace);
          completer.completeError(e, trace);
        });
      }
    });

    return completer.future;
  }

  static void handleError(dynamic error, StackTrace trace, {String message: null}) {
    if (message != null) {
      PinLogger.instance.shout(message);
    }
    PinLogger.instance.shout('Error: ${error}');
    if (trace != null) {
      String traceStr = LibTrace.Trace.format(trace);
      PinLogger.instance.shout('StackTrace: ${traceStr}');
    }
  }

  static String uuid() {
    return (new Uuid()).v4();
  }

}