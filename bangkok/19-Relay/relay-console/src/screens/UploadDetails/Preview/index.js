import React, { useState } from 'react'
import cn from 'classnames'
import Image from '../../../components/Image'
import styles from './Preview.module.sass'
import Icon from '../../../components/Icon'
import TextInput from '../../../components/TextInput'

const Preview = ({ className, onClose, info, image }) => {
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")

  const handleClick = () => {
    const ownerEmail = "owner@example.com"; 
    const subject = "Subject Here"; 
    const body = `Message from: ${email}`; 

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
  }

  return (
    <div className={cn(className, styles.wrap)}>
      <div className={styles.inner}>
        <button className={styles.close} onClick={onClose}>
          <Icon name="close" size="14" />
        </button>
        <div className={styles.info}>Order Your Relay Device Today</div>
        <div className={styles.text}>
          Order now to unlock fast, secure integration with the Polkadot ecosystem!
        </div>
        <div className={styles.fieldsContainer}>
          <TextInput
            className={styles.field}
            label="Email"
            name="email"
            type="text"
            placeholder="e. g. alex12@email.com"
            onChange={(e) => setEmail(e.value)}
            value={email}
            required
          />
          <TextInput
            className={styles.field}
            label="Address"
            name="address"
            type="text"
            placeholder="e. g. 1234 Elm Street, USA"
            onChange={(e) => setAddress(e.value)}
            value={address}
            required
          />
        </div>
        <button
          onClick={handleClick}
          className={cn('button', styles.button)}
        >
          {'Order Now'}
        </button>
      </div>
    </div>
  )
}

export default Preview
