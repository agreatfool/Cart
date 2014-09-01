part of cart;

class CartModel {

  static CartModel _model;

  static CartModel get instance {
    if (_model == null) {
      _model = new CartModel();
    }

    return _model;
  }

  CartPostList posts;
  CartCategoryList categories;
  CartTagList tags;

  CartModel() {
    posts = new CartPostList();
    categories = new CartCategoryList(posts);
    tags = new CartTagList(posts);
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* API: POST
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Future savePost(String uuid, String markdown) {
    final completer = new Completer();

    // validate uuid
    if (!PinUtility.isUuid(uuid)) {
      PinLogger.instance.shout('[CartModel] savePost: uuid format invalid: ${uuid}}');
      completer.complete(null);
    }

    // parse headers
    var header = new CartPostHeader.fromMarkdown(markdown);
    if (header == null) {
      completer.complete(null); // invalid headers format
    }

    // parse markdown to html & escape html
    String html = markdownToHtml(markdown);
    html = (const HtmlEscape()).convert(html);

    if (posts.find(uuid) != null) {
      // update
      _updatePost(uuid, markdown, header, html).then((_) => completer.complete(_));
    } else {
      // add
      _addPost(uuid, markdown, header, html).then((_) => completer.complete(_));
    }

    return completer.future;
  }

  Future removePost(String uuid) {

  }

  Future _addPost(String uuid, String markdown, CartPostHeader header, String html) {
    final completer = new Completer();
    int timestamp = PinTime.getTime();

    HashMap data = {
      'title': header.title,
      'link': header.link,
      'created': timestamp,
      'updated': timestamp,
      'author': CartSystem.instance.session['name'],
      'category': header.category,
      'tags': header.tags,
      'attachments': header.attachments
    };
    var post = new CartPost.fromJson(data);

    // database: post
    posts.add(post);

    // database: category
    var category = categories.find(post.category);
    category.updated = timestamp;
    categories.update(category);
    categories.addPostIntoCategory(post.category, uuid);

    // database: tag
    header.tags.forEach((HashMap<String, String> tagData) {
      var tag = tags.find(tagData['uuid']);
      if (tag != null) {
        tag.updated = timestamp;
        tags.update(tag);
      } else {
        tag = new CartTag.fromJson({
            "uuid": tagData['uuid'],
            "title": tagData['name'],
            "created": timestamp,
            "updated": timestamp
        });
        tags.add(tag);
      }
      tags.addPostIntoTag(tagData['uuid'], uuid);
    });

    // TODO save db files & sync with google drive

    return completer.future;
  }

  Future _updatePost(String uuid, String markdown, CartPostHeader header, String html) {
    final completer = new Completer();
    int timestamp = PinTime.getTime();

    HashMap data = {
        'title': header.title,
        'link': header.link,
        'updated': timestamp,
        'category': header.category,
        'tags': header.tags,
        'attachments': header.attachments
    };
    var post = posts.find(uuid);
    post.title = header.title;
    post.link = header.link;
    post.updated = timestamp;

    // category check
    if (post.category != header.category) {
      categories.switchPostCategory(post.category, header.category, uuid);
      post.category = header.category;
    }

    // TODO
    // tags check

    // attachments check

    return completer.future;
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* API: CATEGORY
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Future addCategory(String uuid, String name) {
    final completer = new Completer();

    var timestamp = PinTime.getTime();

    var category = new CartCategoryList.fromJson({
        "title": name,
        "created": timestamp,
        "updated": timestamp
    });
    categories.add(category);

    // TODO database files & drive

    return completer.future;
  }

  Future removeCategory(String uuid) {

  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* API: TAG
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Future addTag(String uuid, String name) {
    final completer = new Completer();

    var timestamp = PinTime.getTime();

    var tag = new CartTag.fromJson({
        "title": name,
        "created": timestamp,
        "updated": timestamp
    });
    tags.add(tag);

    // TODO database files

    return completer.future;
  }

  Future removeTag(String uuid) {

  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* UTIL: SAVE DATABASE FILES
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Future _saveDatabase() {
    return Future.wait([
      posts.dump(),
      categories.dump(),
      tags.dump()
    ]);
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* UTIL: GOOGLE DRIVER
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-

}