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
          .then((nextResponse) => listPageOfFiles(nextResponse));
      }
    }

    drive_list(maxResults: maxResults, queries: queries)
      .then((GoogleDriveClient.FileList response) => listPageOfFiles(response));

    return completer.future;
  }

  Future<bool> downloadFile(String fileId, String dir) {
    final completer = new Completer();

    drive_get(fileId).then((GoogleDriveClient.File file) {
      if (file.mimeType == mimeFolder
        || file.downloadUrl == null) {
        completer.complete(false);
      } else {
        LibHttp.get(
            file.downloadUrl,
            headers: {'Authorization': 'Bearer ' + _oauth.oauth2.credentials.accessToken}
        ).then((response) {
          new File(LibPath.join(dir, file.title))
            .writeAsBytes(response.bodyBytes)
            .then((_) => completer.complete(true));
        });
      }
    });

    return completer.future;
  }

  Future<GoogleDriveClient.File> uploadFile(String path, {String driveId: null, List<String> parents: null}) {
    final completer = new Completer();
    File file = new File(path);

    Future<GoogleDriveClient.File> upload(String path, String driveId) {
      final completer = new Completer();
      file.readAsBytes().then((List<int> content) {
        drive_update(driveId, content).then((GoogleDriveClient.File updatedFile) {
          completer.complete(updatedFile);
        });
      });
      return completer.future;
    }

    file.exists().then((bool exists) {
      if (!exists) {
        PinLogger.instance.warning('[PinGoogleDrive] uploadFile: Target file does not exist: ${path}');
        completer.complete(null);
      } else {
        if (driveId == null) {
          // need to create file first, then update it
          drive_insert(path, parents: parents).then((GoogleDriveClient.File newFile) {
            upload(path, newFile.id).then((GoogleDriveClient.File uploadedFile) {
              completer.complete(uploadedFile);
            });
          });
        } else {
          // file already exists, update it
          upload(path, driveId).then((GoogleDriveClient.File uploadedFile) {
            completer.complete(uploadedFile);
          });
        }
      }
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

  Future<GoogleDriveClient.File> drive_insert(String path, {List<String> parents: null}) {
    final completer = new Completer();

    File originalFile = new File(path);
    originalFile.exists().then((bool exists) {
      if (!exists) {
        PinLogger.instance.warning('[PinGoogleDrive] drive_insert: Target file does not exist: ${path}');
        completer.complete(null);
      } else {
        var metadata = {
            'title': LibPath.basename(originalFile.path),
        };
        if (parents != null) {
          List<HashMap> metaParents = [];
          parents.forEach((String parentId) {
            metaParents.add({'id': parentId});
          });
          metadata['parents'] = metaParents;
        }

        GoogleDriveClient.File file = new GoogleDriveClient.File.fromJson(metadata);
        _drive.files.insert(file).then((GoogleDriveClient.File newFile){
          completer.complete(newFile);
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
      PinLogger.instance.warning('[PinGoogleDrive] drive_update: Invalid content type: ' + PinUtility.getVariableTypeName(content));
      completer.complete(null);
    }

    _drive.files.get(fileId).then((GoogleDriveClient.File file) {
      _drive.files.update(file, fileId, content: base64content).then((GoogleDriveClient.File updatedFile) {
        completer.complete(updatedFile);
      });
    });

    return completer.future;
  }

}