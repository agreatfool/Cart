part of cart;

class CartCategory extends Object with PinSerializable {

  String uuid;
  String driveId;

  String title;
  int created;
  int updated;

  CartCategory.fromJson(HashMap<String, dynamic> json) {
    if (json.containsKey('uuid')) {
      uuid = json['uuid'];
    } else {
      throw new Exception('[CartCategory] CartCategory.fromJson: "uuid" is required!');
    }
    if (json.containsKey('driveId')) {
      driveId = json['driveId'];
    }
    if (json.containsKey('title')) {
      title = json['title'];
    } else {
      throw new Exception('[CartCategory] CartCategory.fromJson: "title" is required!');
    }
    if (json.containsKey('created')) {
      created = json['created'];
    } else {
      throw new Exception('[CartCategory] CartCategory.fromJson: "created" is required!');
    }
    if (json.containsKey('updated')) {
      updated = json['updated'];
    } else {
      throw new Exception('[CartCategory] CartCategory.fromJson: "updated" is required!');
    }
  }

}

class CartCategoryList extends Object with PinSerializable {

  HashMap<String, CartCategory> list = {};

  CartCategoryList() {
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

  CartCategory findByTitle(String title) {
    CartCategory found = null;
    for (String uuid in list.keys) {
      CartCategory category = list[uuid];
      if (category.title == title) {
        found = category;
        break;
      }
    }
    return found;
  }

  CartCategory addNewCategory(String uuid, String name, {int timestamp: null}) {
    if (list.containsKey(uuid)) {
      throw new Exception('[CartCategoryList] addNewCategory: Duplicate category uuid: ${uuid}!');
    }
    CartCategory titleFound = findByTitle(name);
    if (titleFound != null) {
      throw new Exception('[CartCategoryList] addNewCategory: Duplicate category name: ${name}!');
    }
    if (timestamp == null) {
      timestamp = PinTime.getTime();
    }
    var category = new CartCategory.fromJson({
        "uuid": uuid,
        "title": name,
        "created": timestamp,
        "updated": timestamp
    });
    return add(category);
  }

  CartCategory add(CartCategory category) {
    if (!list.containsKey(category.uuid)) {
      list[category.uuid] = category;
    }

    return category;
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
    return PinUtility.writeJsonFile(CartConst.DB_CATEGORIES_PATH, toJson()['list'], withIndent: true);
  }

}