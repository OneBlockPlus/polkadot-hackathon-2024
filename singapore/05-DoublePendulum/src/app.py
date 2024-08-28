
from flask import Flask, render_template, request, send_from_directory
from api import post_ipfs, post_json_ipfs, post_img_ipfs
from doublependulum import run_simulation
from set_metadata import set_metadata
import os

app = Flask(__name__)
wsendpoint = os.getenv("WSENDPOINT")
collectionid = os.getenv("COLLECTIONID")


@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html', cid=None, video=False, wsendpoint=wsendpoint,
                           collectionid=collectionid, n_pendulums=False, d_diff=False, t_max=False, g=False, m1=False,
                           m2=False, L1=False, L2=False, theta1=False, theta2=False)


@app.route("/mint_nft", methods=["POST"])
def mint_nft():
    data = request.get_json()

    n_pendulums = data.get('n_pendulums')
    d_diff = data.get('d_diff')
    t_max = data.get('t_max')
    g = data.get('g')
    m1 = data.get('m1')
    m2 = data.get('m2')
    L1 = data.get('L1')
    L2 = data.get('L2')
    theta1 = data.get('theta1')
    theta2 = data.get('theta2')

    cid = post_json_ipfs(post_ipfs(), n_pendulums, d_diff, t_max, g, m1, m2, L1, L2, theta1, theta2)

    return cid, 200


@app.route("/set_nft_metadata", methods=["POST"])
def set_nft_metadata():
    data = request.get_json()

    # Extract itemId and cid from the JSON data
    item_id = data.get('itemId')
    cid = data.get('cid')
    set_metadata(item_id, cid)
    return "baf", 200


@app.route('/export', methods=['POST'])
def export():
    n_pendulums = int(request.form['n_pendulums'])
    d_diff = float(request.form['d_diff'])
    t_max = float(request.form['t_max'])
    g = float(request.form['g'])
    m1 = float(request.form['m1'])
    m2 = float(request.form['m2'])
    L1 = float(request.form['L1'])
    L2 = float(request.form['L2'])
    theta1 = float(request.form['theta1'])
    theta2 = float(request.form['theta2'])
    colormap = request.form['colormap']
    background = request.form['background']

    # Run the simulation with the provided parameters and colormap
    run_simulation(n_pendulums, d_diff, t_max, g, m1, m2, L1, L2, theta1, theta2, colormap, background)
    return render_template("index.html", cid=None, video=True, wsendpoint=wsendpoint,
                           collectionid=collectionid, n_pendulums=n_pendulums, d_diff=d_diff, t_max=t_max, g=g, m1=m1,
                           m2=m2, L1=L1, L2=L2, theta1=theta1, theta2=theta2)


@app.route('/save', methods=['POST'])
def save():
    return send_from_directory(".", 'double_pendulum_animation.mp4', as_attachment=True)


if __name__ == '__main__':
    app.run(debug=False, host="0.0.0.0")

