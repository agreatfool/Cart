import 'dart:io';
import 'dart:async';
import 'dart:convert';

import 'package:stack_trace/stack_trace.dart' as LibTrace;

main() {

  Future doItLater() {
    throw 'error!!!';
    return new Future.value(123);
  }

  void handleError(e) {
    print(e);
  }

  doItLater().then((_) {
    print('normal end');
  }).catchError(handleError);

}