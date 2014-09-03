part of cart;

class CartSystem {

  static CartSystem _instance;

  static CartSystem get instance {
    if (_instance == null) {
      _instance = new CartSystem();
    }
    return _instance;
  }

  HashMap setting = {};
  HashMap oauth = {};
  HashMap credentials = {};
  HashMap session = {};

  String googleDriveRootFolder; // google drive id string

  PinGoogleDrive drive;

}