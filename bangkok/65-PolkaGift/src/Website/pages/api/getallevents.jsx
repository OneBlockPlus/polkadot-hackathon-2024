
import React, { useState, useEffect } from 'react';
import {GetAllEvents} from '../../services/api/useContractApi';

export default async function handler(req, res) {
  const output = await GetAllEvents();
  res.status(200).json( JSON.stringify(output))
}