import logging
import sqlite3
from typing import Any, List, Tuple, Optional

logger = logging.getLogger(__name__)


class DBModel:

    def __init__(self, filepath):
        self.filepath = filepath
        self.connection = None

    def get_connection(self) -> sqlite3.Connection:
        if self.connection is None:
            self.connection = sqlite3.connect(self.filepath)
            self.connection.row_factory = sqlite3.Row
        return self.connection

    def commit(self):
        self.get_connection().commit()

    def close(self):
        self.get_connection().close()
        self.connection = None

    def select_value(self, cur, sql: str, sql_params: Tuple[Any] = ()):
        try:
            return cur.execute(sql, sql_params).fetchone()
        except sqlite3.DatabaseError as error:
            logger.error(error)

    def get_record_by_id(self, table: str, rec_id: int, columns: List[str] = []):
        cur = self.get_connection().cursor()
        col_sel = '","'.join(columns)
        if len(col_sel) == 0:
            col_sel = "*"
        else:
            col_sel = f'"{col_sel}"'

        query = "SELECT {} FROM {} WHERE id = %s".format(col_sel, table)

        return self.select_value(cur=cur, sql=query, sql_params=(rec_id,))

    def get_client_records_by_name(self, name) -> List[sqlite3.Row]:
        cur = self.get_connection().cursor()

        query = "SELECT C.id, C.name, C.dna_fingerprint, G.id as gid, G.sequenced_at, " \
                "G.full_file_name, G.diff_file_name, G.ipfs_cid, G.ap_uuid, G.mutations, G.cos_dist " \
                "FROM clients C " \
                "LEFT JOIN genomes G ON G.client_id = C.id " \
                "WHERE C.name = ? COLLATE NOCASE " \
                "ORDER BY G.sequenced_at"

        result = cur.execute(query, (name,))
        return result.fetchall()

    def update_uuid(self, genome_id: int, ap_uuid: str):
        cur = self.get_connection().cursor()
        cur.execute("UPDATE genomes SET ap_uuid = ? WHERE id = ?",
                    (ap_uuid, genome_id))
        self.commit()
