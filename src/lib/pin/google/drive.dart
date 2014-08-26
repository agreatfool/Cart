part of pin;

class PinGoogleDrive {

  GoogleDrive.Drive _drive;
  PinGoogleOAuth _oauth;

  PinGoogleDrive(this._oauth) {
    _drive = new GoogleDrive.Drive(_oauth.oauth2);
    _drive.makeAuthRequests = true;
  }

  Future<HashMap> listFiles({HashMap queryParams: null}) {
    return _drive.request('files', 'GET', queryParams: queryParams);
  }

}