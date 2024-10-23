import React, { useState, useCallback, useEffect, useRef } from 'react'
import cn from 'classnames'
import { useRouter } from 'next/router'
import AppLink from '../AppLink'
import Loader from '../Loader'
import registerFields from '../../utils/constants/registerFields'
import { useStateContext } from '../../utils/context/StateContext'
import { setToken } from '../../utils/token'
import TextInput from '../TextInput'
import { toast } from 'react-hot-toast';
import { generateMnemonic } from '@polkadot/util-crypto/mnemonic/bip39'

import styles from './OAuth.module.sass'

const OAuth = ({ className, handleClose, handleOAuth, disable, setIsGenerateClicked, smallPubKey, largePubKey }) => {
  const { setCosmicUser } = useStateContext()
  const { push } = useRouter()

  const [{ email, password }, setFields] = useState(() => registerFields)
  const [fillFiledMessage, setFillFiledMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [smallMnemonic, setSmallMnemonic] = useState(generateMnemonic(12))
  const [largeMnemonic, setLargeMnemonic] = useState(generateMnemonic(12))

  const inputElement = useRef(null)

  useEffect(() => {
    if (inputElement.current) {
      inputElement.current.focus()
    }
  }, [disable])

  const handleGoHome = () => {
    push('/')
  }

  const handleChange = ({ target: { name, value } }) =>
    setFields(prevFields => ({
      ...prevFields,
      [name]: value,
    }))

  const submitForm = useCallback(
    async e => {
      e.preventDefault()
      fillFiledMessage?.length && setFillFiledMessage('')
      setLoading(true)
      if ((email, password)) {
        const auth = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })
        const cosmicUser = await auth.json()
        if (cosmicUser?.hasOwnProperty('user')) {
          setCosmicUser(cosmicUser['user'])
          setToken({
            id: cosmicUser['user']['id'],
            first_name: cosmicUser['user']['first_name'],
            avatar_url: cosmicUser['user']['avatar_url'],
          })

          setFillFiledMessage('Congrats!')
          handleOAuth(cosmicUser['user'])
          setFields(registerFields)
          handleClose()
        } else {
          setFillFiledMessage('Congrats!')
        }
      } else {
        setTimeout(() => {
          toast.success("Account created successfully!")
          setFillFiledMessage('Congrats!')
          handleClose()
          setIsGenerateClicked(false)
        }, 3000)
      }
      setLoading(false)
    },
    [
      fillFiledMessage?.length,
      email,
      password,
      setCosmicUser,
      handleOAuth,
      handleClose,
      loading,
    ]
  )

  return (
    <div className={cn(className, styles.transfer)}>
      <div className={cn('h4', styles.title)}>
        Save Your Recovery {' '}
        <AppLink target="_blank" href={`https://www.cosmicjs.com`}>
          Phrase
        </AppLink>
      </div>
      <div className={styles.error}>{fillFiledMessage}</div>
      <form className={styles.form} action="submit" onSubmit={submitForm}>
        <div className={styles.fieldsContainer}>
          <div className={styles.field}>
            <TextInput
              className={styles.field}
              label="Small Transaction Public Key"
              name="username"
              type="text"
              placeholder="e. g. Bishop"
              onChange={handleChange}
              value={smallPubKey}
              disable
            />
          </div>
          <div className={styles.field}>
            <TextInput
              className={styles.field}
              label="Mnemonic"
              name="username"
              type="text"
              placeholder="e. g. Bishop"
              onChange={handleChange}
              value={smallMnemonic}
              disable
            />
          </div>
          <div className={styles.field}>
            <TextInput
              className={styles.field}
              label="Large Transaction Public Key"
              name="username"
              type="text"
              placeholder="e. g. Bishop"
              onChange={handleChange}
              value={largePubKey}
              disable
            />
          </div>
          <div className={styles.field}>
            <TextInput
              className={styles.field}
              label="Mnemonic"
              name="username"
              type="text"
              placeholder="e. g. Bishop"
              onChange={handleChange}
              value={largeMnemonic}
              disable
            />
          </div>
        </div>
        <div className={styles.btns}>
          <button type="submit" className={cn('button', styles.button)} onClick={() => setLoading(true)}>
            {loading ? <Loader /> : 'Generate Account'}
          </button>
          <button
            onClick={disable ? handleGoHome : handleClose}
            className={cn('button-stroke', styles.button)}
          >
            {'Cancel'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default OAuth
