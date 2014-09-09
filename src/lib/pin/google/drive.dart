part of pin;

class PinGoogleDrive {

  static const String qIsRootFiles = "'root' in parents";
  static const String qIsFolder = "mimeType = 'application/vnd.google-apps.folder'";

  static const String mimeFolder = 'application/vnd.google-apps.folder';

  GoogleDrive.Drive _drive;
  PinGoogleOAuth _oauth;

  PinGoogleDrive(this._oauth) {
    _drive = new GoogleDrive.Drive(_oauth.oauth2);
    _drive.makeAuthRequests = true;
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* HIGH LEVEL APIs
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Future<List<GoogleDriveClient.File>> listAll({int maxResults: 100, List<String> queries: null}) {
    var files = new List<GoogleDriveClient.File>();
    final completer = new Completer();

    void listPageOfFiles(GoogleDriveClient.FileList response) {
      // handle response files data
      List items = response.items;
      if (items.length > 0) {
        files.addAll(items);
      }
      if (response.nextPageToken == null) {
        // this is the final page, finish the future
        completer.complete(files);
      } else {
        // still has next page, retrieve it
        drive_list(maxResults: maxResults, pageToken: response.nextPageToken, queries: queries)
        .then((nextResponse) => listPageOfFiles(nextResponse))
        .catchError((e, trace) {
          PinUtility.handleError(e, trace);
          completer.completeError(e, trace);
        });
      }
    }

    drive_list(maxResults: maxResults, queries: queries)
    .then((GoogleDriveClient.FileList response) => listPageOfFiles(response))
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

  Future<bool> downloadFile(String fileId, String dir) {
    final completer = new Completer();

    String fileTitle = '';

    drive_get(fileId)
    .then((GoogleDriveClient.File file) {
      if (file.mimeType == mimeFolder
        || file.downloadUrl == null) {
        throw new Exception('[PinGoogleDrive] downloadFile: Wrong file type: ${file.mimeType}');
      } else {
        fileTitle = file.title;
        return LibHttp.get(
            file.downloadUrl,
            headers: {'Authorization': 'Bearer ' + _oauth.oauth2.credentials.accessToken}
        );
      }
    })
    .then((response) => (new File(LibPath.join(dir, fileTitle))).writeAsBytes(response.bodyBytes))
    .then((_) => completer.complete(true))
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

  Future<GoogleDriveClient.File> uploadFile(String path, {String driveId: null, List<String> parents: null}) {
    final completer = new Completer();
    File file = new File(path);

    file.exists()
    .then((bool exists) {
      if (!exists) {
        throw new Exception('[PinGoogleDrive] uploadFile: Target file does not exist: ${path}');
      } else {
        if (driveId == null) {
          // need to create file first, then update it
          return drive_insert(path, parents: parents);
        } else {
          // file already exists, update it
          return new Future.value(null);
        }
      }
    })
    .then((GoogleDriveClient.File newFile) {
      if (newFile != null) {
        // means last step is insert new file
        driveId = newFile.id;
      }
      return file.readAsBytes();
    })
    .then((List<int> content) => drive_update(driveId, content))
    .then((GoogleDriveClient.File uploadedFile) => completer.complete(uploadedFile))
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* DRIVE ORIGINAL APIs
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Future<GoogleDriveClient.FileList> drive_list({
    int maxResults: 100, String pageToken: null, List<String> queries: null
  }) {
    return _drive.files.list(maxResults: maxResults, q: queries.join(' and '), pageToken: pageToken);
  }

  Future<GoogleDriveClient.File> drive_get(String fileId) {
    return _drive.files.get(fileId);
  }

  Future drive_delete(String fileId) {
    return _drive.files.delete(fileId);
  }

  Future<GoogleDriveClient.File> drive_trash(String fileId) {
    return _drive.files.trash(fileId);
  }

  Future<GoogleDriveClient.File> drive_untrash(String fileId) {
    return _drive.files.untrash(fileId);
  }

  Future<GoogleDriveClient.File> drive_folder(String name, {List<String> parents: null}) {
    final completer = new Completer();

    var metadata = {
        "title": name,
        "mimeType": "application/vnd.google-apps.folder"
    };
    if (parents != null) {
      List<HashMap> metaParents = [];
      parents.forEach((String parentId) {
        metaParents.add({'id': parentId});
      });
      metadata['parents'] = metaParents;
    }

    GoogleDriveClient.File file = new GoogleDriveClient.File.fromJson(metadata);
    _drive.files.insert(file)
    .then((GoogleDriveClient.File newFile){
      completer.complete(newFile);
    })
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

  Future<GoogleDriveClient.File> drive_insert(String path, {List<String> parents: null}) {
    final completer = new Completer();

    File originalFile = new File(path);
    originalFile.exists().then((bool exists) {
      if (!exists) {
        try {
          throw new Exception('[PinGoogleDrive] drive_insert: Target file does not exist: ${path}');
        } catch (e, trace) {
          PinUtility.handleError(e, trace);
          completer.completeError(e, trace);
        }
      } else {
        var metadata = {
            "title": LibPath.basename(originalFile.path),
        };
        if (parents != null) {
          List<HashMap> metaParents = [];
          parents.forEach((String parentId) {
            metaParents.add({'id': parentId});
          });
          metadata['parents'] = metaParents;
        }

        GoogleDriveClient.File file = new GoogleDriveClient.File.fromJson(metadata);
        _drive.files.insert(file)
        .then((GoogleDriveClient.File newFile){
          completer.complete(newFile);
        })
        .catchError((e, trace) {
          PinUtility.handleError(e, trace);
          completer.completeError(e, trace);
        });
      }
    });

    return completer.future;
  }

  Future<GoogleDriveClient.File> drive_update(String fileId, dynamic content) {
    final completer = new Completer();
    String base64content;

    if (content is String) {
      base64content = CryptoUtils.bytesToBase64(content.codeUnits);
    } else if (content is List<int>) {
      base64content = CryptoUtils.bytesToBase64(content);
    } else {
      try {
        throw new Exception('[PinGoogleDrive] drive_update: Invalid content type: ' + PinUtility.getVariableTypeName(content));
      } catch (e, trace) {
        PinUtility.handleError(e, trace);
        completer.completeError(e, trace);
      }
    }

    _drive.files.get(fileId)
    .then((GoogleDriveClient.File file) {
      return _drive.files.update(file, fileId, content: base64content);
    })
    .then((GoogleDriveClient.File updatedFile) {
      completer.complete(updatedFile);
    })
    .catchError((e, trace) {
      PinUtility.handleError(e, trace);
      completer.completeError(e, trace);
    });

    return completer.future;
  }

}