part of cart;

class CartCategory extends Object with PinSerializable {

  String uuid;
  String driveId;

  String title;
  int created;
  int updated;
  bool isPublic = false;

  CartCategory.fromJson(HashMap<String, dynamic> json) {
    if (json.containsKey('uuid')) {
      uuid = json['uuid'];
    }
    if (json.containsKey('driveId')) {
      driveId = json['driveId'];
    }
    if (json.containsKey('title')) {
      title = json['title'];
    }
    if (json.containsKey('created')) {
      created = json['created'];
    }
    if (json.containsKey('updated')) {
      updated = json['updated'];
    }
    if (json.containsKey('isPublic')) {
      isPublic = json['isPublic'];
    }
  }

}

class CartCategoryList extends Object with PinSerializable {

  HashMap<String, CartCategory> list = {};

  CartCategoryList(CartPostList postList) {
    HashMap categories = PinUtility.readJsonFileSync(CartConst.DB_CATEGORIES_PATH);

    if (categories.length <= 0) {
      return;
    }
    categories.forEach((String uuid, HashMap json) {
      var category = new CartCategory.fromJson(json);
      list.addAll({uuid: category});
    });
  }

  CartCategory find(String uuid) {
    if (list.containsKey(uuid)) {
      return list[uuid];
    } else {
      return null;
    }
  }

  void addNewCategory(String uuid, String name, {int timestamp: null}) {
    if (list.containsKey(uuid)) {
      return;
    }
    if (timestamp == null) {
      timestamp = PinTime.getTime();
    }
    var category = new CartCategoryList.fromJson({
        "uuid": uuid,
        "title": name,
        "created": timestamp,
        "updated": timestamp
    });
    add(category);
  }

  void add(CartCategory category) {
    if (list.containsKey(category.uuid)) {
      return;
    }
    list[category.uuid] = category;
  }

  void update(CartCategory category) {
    if (!list.containsKey(category.uuid)) {
      return;
    }
    list[category.uuid] = category;
  }

  void remove(String uuid, CartPostList postList) {
    if (!list.containsKey(uuid)) {
      return;
    }
    // category
    list.remove(uuid);
    // posts
    postList.removePostsViaCategory(uuid);
  }

  Future<File> dump() {
    return PinUtility.writeJsonFile(CartConst.DB_CATEGORIES_PATH, toJson()['list']);
  }

}