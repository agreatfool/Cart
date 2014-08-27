part of pin;

class PinGoogleDrive {

  static const String qRootFiles = "'root' in parents";
  static const String qFolder = "mimeType = 'application/vnd.google-apps.folder'";

  GoogleDrive.Drive _drive;
  PinGoogleOAuth _oauth;

  PinGoogleDrive(this._oauth) {
    _drive = new GoogleDrive.Drive(_oauth.oauth2);
    _drive.makeAuthRequests = true;
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* HIGH LEVEL APIs
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Future<List> listAll({HashMap queryParams: null}) {
    var files = new List();
    final completer = new Completer();

    Future<HashMap> listPageOfFiles(HashMap response) {
      // handle response files data
      List items = response['items'];
      if (items.length > 0) {
        files.addAll(items);
      }
      if (!response.containsKey('nextPageToken')) {
        // this is the final page, finish the future
        completer.complete(files);
      } else {
        // still has next page, retrieve it
        HashMap params = {
          'pageToken': response['nextPageToken']
        };
        params.addAll(queryParams);
        drive_list(queryParams: params)
          .then((nextResponse) => listPageOfFiles(nextResponse));
      }
    }

    drive_list(queryParams: queryParams)
      .then((response) => listPageOfFiles(response));

    return completer.future;
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* DRIVE ORIGINAL APIs
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Future<HashMap> drive_list({HashMap queryParams: null}) {
    return _drive.request('files', 'GET', queryParams: queryParams);
  }

}