part of cart;

class CartSystem {

  static CartSystem _instance;

  static CartSystem get instance {
    if (_instance == null) {
      _instance = new CartSystem();
    }
  }

  Map setting = {};
  Map oauth = {};
  Map credentials = {};

}