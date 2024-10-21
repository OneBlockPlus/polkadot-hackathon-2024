from flask import Flask, render_template, jsonify, request
from db_model import DBModel
import api_storage_module.api_storage.storage_management as storage

app = Flask(__name__)
model = DBModel("api_storage_module/genomtex.sqlite")


@app.teardown_appcontext
def close_connection(exception):
    model.close()


@app.route('/')
def index():  # put application's code here
    return render_template('index.html')


@app.route('/record/<string:name>')
def get_record(name: str):
    """
    Get client's records by his name
    """

    records = model.get_client_records_by_name(name)
    client = None
    if len(records) > 0:
        client = {
            "id": records[0]["id"],
            "name": records[0]["name"],
            "dna_fingerprint": records[0]["dna_fingerprint"],
        }
    records = [{
        "id": record["gid"],
        "uuid": record["ap_uuid"],
        "sequenced_at": record["sequenced_at"].split(" ")[0],
        "full_file_name": record["full_file_name"],
        "diff_file_name": record["diff_file_name"],
        "ipfs_cid": record["ipfs_cid"],
        "mutations": record["mutations"],
        "cos_dist": "{:.8f}".format(record["cos_dist"]),
    } for record in records]

    return render_template('record.html', name=name, client=client, records=records)


@app.route('/dev_record/<string:name>')
def dev_get_record(name: str):
    """
    Get client's records by his name
    """

    records = model.get_client_records_by_name(name)
    client = None
    if len(records) > 0:
        client = {
            "id": records[0]["id"],
            "name": records[0]["name"],
            "dna_fingerprint": records[0]["dna_fingerprint"],
        }
    records = [{
        "id": record["gid"],
        "uuid": record["ap_uuid"],
        "sequenced_at": record["sequenced_at"].split(" ")[0],
        "full_file_name": record["full_file_name"],
        "diff_file_name": record["diff_file_name"],
        "ipfs_cid": record["ipfs_cid"],
        "mutations": record["mutations"],
        "cos_dist": "{:.8f}".format(record["cos_dist"]),
    } for record in records]

    return render_template('dev_record.html', name=name, client=client, records=records)


@app.route('/upload', methods=['POST'])
def save_to_appilon():
    """
    AJAX call to upload a file to Appilon API
    """

    genome_id = request.form.get("genome_id")
    filename = request.form.get("filename")

    #ap_uuid = storage.sync_file(filename, cid=None)
    #model.update_uuid(genome_id, ap_uuid)

    # uncomment this to test loading button
    #from time import sleep
    #sleep(3)

    ap_uuid = "ABC"
    return jsonify({"uuid": ap_uuid})


if __name__ == '__main__':
    app.run(debug=True)
