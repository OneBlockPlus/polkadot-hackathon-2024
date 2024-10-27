
import React, { useState, useEffect } from 'react';
import {GetAllNftsEventID} from '../../../services/api/useContractApi';

export default async function handler(req, res) {
  let id = (req.query.id)
  let output =await GetAllNftsEventID(id)

  res.status(200).json(output)
}