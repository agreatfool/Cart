part of cart;

class CartCategory extends Object implements Serializable {

  String uuid;
  String driveId;

  String title;
  int created;
  int updated;

  CartCategory.fromJson(HashMap<String, dynamic> json) {
    if (json.containsKey('uuid')) {
      uuid = json['uuid'];
    }
    if (json.containsKey('driveId')) {
      uuid = json['driveId'];
    }
    if (json.containsKey('title')) {
      uuid = json['title'];
    }
    if (json.containsKey('created')) {
      uuid = json['created'];
    }
    if (json.containsKey('updated')) {
      uuid = json['updated'];
    }
  }

}

class CartCategoryList extends Object implements Serializable {

  HashMap<String, CartCategory> list = {};
  HashMap<String, List<String>> categoryPosts = {}; // {categoryUuid: [postUuid, postUuid, ...], ...}


  CartCategoryList(String path, CartPostList postList) {
    HashMap categories = PinUtility.readJsonFileSync(CartConst.DB_CATEGORIES_PATH);

    if (categories.length > 0) {
      categories.forEach((String uuid, HashMap json) {
        var category = new CartCategory.fromJson(json);
        list.addAll({uuid: category});
      });

      if (postList.list.length > 0) {
        postList.postsOrderByCreated.forEach((postUuid) {
          CartPost post = postList.find(postUuid);
          String categoryUuid = post.category;

          // category
          if (!categoryPosts.containsKey(categoryUuid)) {
            categoryPosts[categoryUuid] = [postUuid];
          } else {
            categoryPosts[categoryUuid].add(postUuid);
          }
        });
      }
    }
  }

  Future<File> dump() {
    return PinUtility.writeJsonFile(CartConst.DB_CATEGORIES_PATH, toJson());
  }

}