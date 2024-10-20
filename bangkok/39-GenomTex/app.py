from flask import Flask, render_template
from db_model import DBModel

from datetime import datetime

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
        "uuid": record["ap_uuid"],
        "sequenced_at": record["sequenced_at"].split(" ")[0],
        "full_file_name": record["full_file_name"],
        "diff_file_name": record["diff_file_name"],
        "ipfs_cid": record["ipfs_cid"],
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
        "uuid": record["ap_uuid"],
        "sequenced_at": record["sequenced_at"].split(" ")[0],
        "full_file_name": record["full_file_name"],
        "diff_file_name": record["diff_file_name"],
        "ipfs_cid": record["ipfs_cid"],
    } for record in records]

    return render_template('dev_record.html', name=name, client=client, records=records)


if __name__ == '__main__':
    app.run(debug=True)
