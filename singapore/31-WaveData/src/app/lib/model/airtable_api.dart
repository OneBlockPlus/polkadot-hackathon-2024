import 'dart:convert';
import 'package:dio/dio.dart';

class base {
  final String apiKey =
      "patQvXPSOwdPxJ37f.246be6a5d6659407e4e40a4dc35095c7c9ddc312fd981f2d5b0305dc8dd48e12";
  final String baseId = "appdP1KvBGkbsess3";
  final String tableName;

  final Dio dio = Dio();

  base(this.tableName) {
    dio.options.headers = {
      'Authorization': 'Bearer $apiKey',
      'Content-Type': 'application/json',
    };
  }

  Future<void> create(Map<String, dynamic> data) async {
    try {
      final response = await dio.post(
        'https://api.airtable.com/v0/$baseId/$tableName',
        data: {'fields': data},
      );

      if (response.statusCode == 200) {
        print('Record created successfully');
      } else {
        print('Error creating record: ${response.statusCode}');
      }
    } catch (e) {
      print('Error: $e');
    }
  }

  Future<List<Map<String, dynamic>>> select({String? filterBy, List<Map<String, String>>? sortBy}) async {
    final dio = Dio();
    var queryParams = filterBy != null && sortBy != null ? {'filterByFormula': filterBy,'sort':sortBy} :  (filterBy != null ?{'filterByFormula': filterBy}: null);

    final response = await dio.get(
      'https://api.airtable.com/v0/$baseId/$tableName',
      queryParameters: queryParams,
      options: Options(headers: {
        'Authorization': 'Bearer $apiKey',
      }),
    );

    if (response.statusCode == 200) {
      final data = (response.data);
      final records = (data['records'] as List).map((record) {
        var record_each =  record['fields'] as Map<String, dynamic>;
        record_each['id'] = (record['id'] as String);
        return record_each;
      }).toList();
      return records;
    } else {
      throw Exception('Failed to load records');
    }
  }

  Future<Map<String, dynamic>> find(String recordId) async {
    final dio = Dio();

    final response = await dio.get(
      'https://api.airtable.com/v0/$baseId/$tableName/$recordId',
      options: Options(headers: {
        'Authorization': 'Bearer $apiKey',
      }),
    );

    if (response.statusCode == 200) {
      final data =(response.data);
      final record = data['fields'] as Map<String, dynamic>;
      return record;
    } else {
      throw Exception('Failed to load record');
    }
  }

  Future<void> update(
      String recordId, Map<String, dynamic> updatedFields) async {
    final dio = Dio();

    final response = await dio.patch(
      'https://api.airtable.com/v0/$baseId/$tableName/$recordId',
      options: Options(
        headers: {
          'Authorization': 'Bearer $apiKey',
          'Content-Type': 'application/json',
        },
      ),
      data: {
        'fields': updatedFields,
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to update record');
    }
  }
}
