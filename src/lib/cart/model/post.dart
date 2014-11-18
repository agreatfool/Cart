part of cart;

class CartPost extends Object with PinSerializable {

  String uuid;
  String driveId; // id of google drive

  String title;
  int created;
  int updated;

  String category; // uuid
  List<String> tags = []; // [uuid, uuid, ...]
  HashMap<String, CartPostAttachment> attachments = {};

  CartPost.fromJson(HashMap<String, dynamic> json) {
    if (json.containsKey('uuid')) {
      uuid = json['uuid'];
    } else {
      throw new Exception('[CartPost] CartPost.fromJson: "uuid" is required!');
    }
    if (json.containsKey('title')) {
      title = json['title'];
    } else {
      throw new Exception('[CartPost] CartPost.fromJson: "title" is required!');
    }
    if (json.containsKey('created')) {
      created = json['created'];
    } else {
      throw new Exception('[CartPost] CartPost.fromJson: "created" is required!');
    }
    if (json.containsKey('updated')) {
      updated = json['updated'];
    } else {
      throw new Exception('[CartPost] CartPost.fromJson: "updated" is required!');
    }
    if (json.containsKey('category')) {
      category = json['category'];
    } else {
      throw new Exception('[CartPost] CartPost.fromJson: "category" is required!');
    }
    if (json.containsKey('driveId')) {
      driveId = json['driveId'];
    }
    if (json.containsKey('tags')) {
      tags = json['tags'];
    }
    if (json.containsKey('attachments') && json['attachments'] is Iterable) {
      json['attachments'].forEach((HashMap attachData) {
        CartPostAttachment attachment = new CartPostAttachment.fromJson(attachData);
        attachments.addAll({ attachment.uuid: attachment });
      });
    }
  }

  bool isPublic() {
    bool isPublic = true;

    for (var i = 0; i < tags.length; i++) {
      String tagUuid = tags[i];
      if (tagUuid == CartSystem.instance.tagPrivate['uuid']) {
        isPublic = false;
        break;
      }
    }

    return isPublic;
  }

  void addTagUuid(String uuid) {
    if (tags.contains(uuid)) {
      return;
    }
    tags.add(uuid);
  }

  void removeTagUuid(String uuid) {
    tags.remove(uuid);
  }

  void addNewAttachment(String uuid, String name, {int timestamp: null}) {
    if (attachments.containsKey(uuid)) {
      return;
    }
    if (timestamp == null) {
      timestamp = PinTime.getTime();
    }
    var attachment = new CartPostAttachment.fromJson({
        "uuid": uuid,
        "title": name,
        "created": timestamp,
        "updated": timestamp
    });
    addAttachment(attachment);
  }

  void addAttachment(CartPostAttachment attachment) {
    if (attachments.containsKey(uuid)) {
      return;
    }
    attachments.addAll({ attachment.uuid: attachment });
  }

  void updateAttachment(CartPostAttachment attachment) {
    if (!attachments.containsKey(attachment.uuid)) {
      return;
    }
    attachments[attachment.uuid] = attachment;
  }

  void removeAttachment(CartPostAttachment attachment) {
    attachments.remove(attachment.uuid);
  }

  CartPostAttachment findAttachment(String uuid) {
    if (attachments.containsKey(uuid)) {
      return attachments[uuid];
    } else {
      return null;
    }
  }

  HashMap generateHeaderInfo() {
    HashMap<String, HashMap> headerTags = {};
    HashMap<String, HashMap> headerAttachments = {};

    tags.forEach((String tagUuid) {
      headerTags.addAll({ tagUuid: CartModel.instance.tagList.find(tagUuid).toJson() });
    });
    attachments.forEach((String attachUuid, CartPostAttachment attachment) {
      headerAttachments.addAll({ attachUuid: attachment.toJson() });
    });

    return {
        "uuid": uuid,
        "title": title,
        "category": CartModel.instance.categoryList.find(category).toJson(),
        "tags": headerTags,
        "attachments": headerAttachments
    };
  }

  String generateMarkdownWithHeader(String markdown) {
    return '<div id="mdHeader" style="display:none;"><div class="mdHeaderData">' + JSON.encode(generateHeaderInfo()) + '</div></div>' + markdown;
  }

  static HashMap parseMarkdownHeader(String markdown) {
    HashMap header = {};

    LibHtml5.Document doc = LibHtml5.parse(markdown);
    doc.querySelectorAll('div').forEach((LibHtml5.Element element) {
      if (element.attributes.keys.contains('class') && element.attributes['class'] == 'mdHeaderData') {
        header = JSON.decode(element.innerHtml);
      }
    });

    return header;
  }

  static String parseMarkdownContent(String markdown) {
    // remove post header info from markdown string
    String delimiter = '</div></div>';
    return markdown.substring(markdown.indexOf(delimiter) + delimiter.length);
  }

}

class CartPostList extends Object with PinSerializable {

  HashMap<String, CartPost> list = {};

  CartPostList() {
    HashMap posts = PinUtility.readJsonFileSync(CartConst.DB_POSTS_PATH);

    if (posts.length <= 0) {
      return;
    }
    posts.forEach((String uuid, HashMap json) {
      var post = new CartPost.fromJson(json);
      list.addAll({uuid: post});
    });
  }

  CartPost find(String uuid) {
    if (list.containsKey(uuid)) {
      return list[uuid];
    } else {
      return null;
    }
  }

  void add(CartPost post) {
    if (list.containsKey(post.uuid)) {
      return;
    }
    list[post.uuid] = post;
  }

  void update(CartPost post) {
    if (!list.containsKey(post.uuid)) {
      return;
    }
    list[post.uuid] = post;
  }

  void remove(String uuid) {
    list.remove(uuid);
  }

  void removePostsViaCategory(String categoryUuid) {
    if (list.length <= 0) {
      return;
    }
    list.forEach((String postUuid, CartPost post) {
      if (post.category == categoryUuid) {
        remove(postUuid);
      }
    });
  }

  Future<File> dump() {
    return PinUtility.writeJsonFile(CartConst.DB_POSTS_PATH, toJson()['list'], withIndent: true);
  }

}

class CartPostAttachment extends Object with PinSerializable {
  String uuid;
  String driveId; // id of google drive

  String title; // attachment file name
  int created;
  int updated;

  CartPostAttachment.fromJson(HashMap<String, dynamic> json) {
    if (json.containsKey('uuid')) {
      uuid = json['uuid'];
    } else {
      throw new Exception('[CartPostAttachment] CartPostAttachment.fromJson: "uuid" is required!');
    }
    if (json.containsKey('driveId')) {
      driveId = json['driveId'];
    }
    if (json.containsKey('title')) {
      title = json['title'];
    } else {
      throw new Exception('[CartPostAttachment] CartPostAttachment.fromJson: "title" is required!');
    }
    if (json.containsKey('created')) {
      created = json['created'];
    } else {
      throw new Exception('[CartPostAttachment] CartPostAttachment.fromJson: "created" is required!');
    }
    if (json.containsKey('updated')) {
      updated = json['updated'];
    } else {
      throw new Exception('[CartPostAttachment] CartPostAttachment.fromJson: "updated" is required!');
    }
  }
}

class CartPostHeader extends Object with PinSerializable {

  String uuid;
  String title;
  CartCategory category;
  HashMap<String, CartTag> tags = {};
  HashMap<String, CartPostAttachment> attachments = {};

  static CartPostHeader parseFromMarkdown(String uuid, String markdown) {
    int timestamp = PinTime.getTime();

    HashMap headerUploaded = CartPost.parseMarkdownHeader(markdown);

    if (!headerUploaded.containsKey('uuid')) {
      throw new Exception('[CartPostHeader] Header info of post: "uuid" is required!');
    }
    if (!headerUploaded.containsKey('title')) {
      throw new Exception('[CartPostHeader] Header info of post: "title" is required!');
    }
    if (!headerUploaded.containsKey('category')) {
      throw new Exception('[CartPostHeader] Header info of post: "category" is required!');
    }

    CartPostHeader header = new CartPostHeader();

    if (uuid != headerUploaded['uuid']) {
      throw new Exception('[CartPostHeader] Header info "uuid" is inconsistent with uuid in request params!');
    }
    header.uuid = headerUploaded['uuid'];
    header.title = headerUploaded['title'];

    CartCategory category = CartModel.instance.categoryList.find(headerUploaded['category']['uuid']);
    if (category == null) {
      throw new Exception('[CartPostHeader] Category specified in header info not found: \n${headerUploaded['category']}');
    }
    category.updated = timestamp;
    header.category = category;

    if (headerUploaded.containsKey('tags')) {
      headerUploaded['tags'].forEach((String tagUuid, HashMap tagData) {
        CartTag tag = CartModel.instance.tagList.find(tagUuid);
        if (tag == null) {
          throw new Exception('[CartPostHeader] Tag specified in header info not found: \n${tagData}');
        }
        tag.updated = timestamp;
        header.tags.addAll({ tag.uuid: tag });
      });
    }

    if (headerUploaded.containsKey('attachments')) {
      headerUploaded['attachments'].forEach((String attachUuid, HashMap attachData) {
        CartPostAttachment attachment = new CartPostAttachment.fromJson(attachData);
        if (!(new File(LibPath.join(CartConst.WWW_POST_PUB_PATH, uuid, attachment.title))).existsSync()) {
          throw new Exception('[CartPostHeader] Attachment specified in header info not found: \n${attachData}');
        }
        header.attachments.addAll({ attachment.uuid: attachment });
      });
    }

    return header;
  }

}