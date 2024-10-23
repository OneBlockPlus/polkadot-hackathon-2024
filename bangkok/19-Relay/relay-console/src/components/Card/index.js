import React, { useState } from 'react'
import cn from 'classnames'
import AppLink from '../AppLink'
import styles from './Card.module.sass'
import Icon from '../Icon'
import Image from '../Image'

const Card = ({ className, item }) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className={cn(styles.card, className)} aria-hidden="true">
      <AppLink className={styles.link} href={`/item/${item?.slug}` || '/'}>
        <div className={styles.preview}>
          <p className={styles.bid}>{item?.title}</p>
        </div>
        <div className={styles.foot}>
          <div className={styles.status}>
            <p className={styles.count}>
              {item?.metadata?.count > 0
                ? `${item?.metadata?.color}`
                : 'Not Available'}
            </p>
          </div>
          <div
            className={styles.bid}
            dangerouslySetInnerHTML={{ __html: item?.count }}
          />
          <span className={styles.price}>{`DOT ${item?.metadata?.price}`}</span>
        </div>
      </AppLink>
    </div>
  )
}

export default Card
