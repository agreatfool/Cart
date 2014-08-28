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

}