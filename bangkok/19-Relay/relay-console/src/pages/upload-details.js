import React, { useState, useCallback, useEffect } from 'react'
import cn from 'classnames'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { useStateContext } from '../utils/context/StateContext'
import Layout from '../components/Layout'
import Dropdown from '../components/Dropdown'
import Icon from '../components/Icon'
import TextInput from '../components/TextInput'
import Loader from '../components/Loader'
import Modal from '../components/Modal'
import OAuth from '../components/OAuth'
import Preview from '../screens/UploadDetails/Preview'
import Cards from '../screens/UploadDetails/Cards'
import { getAllDataByType } from '../lib/cosmic'
import { OPTIONS } from '../utils/constants/appConstants'
import createFields from '../utils/constants/createFields'
import { getToken } from '../utils/token'
import { mnemonicGenerate } from '@polkadot/util-crypto'

import styles from '../styles/pages/UploadDetails.module.sass'
import { PageMeta } from '../components/Meta'

const Upload = ({ navigationItems, categoriesType }) => {
  const { categories, navigation, cosmicUser } = useStateContext()
  const { push } = useRouter()

  const [color, setColor] = useState(OPTIONS[1])
  const [uploadMedia, setUploadMedia] = useState('')
  const [uploadFile, setUploadFile] = useState('')
  const [chooseCategory, setChooseCategory] = useState('')
  const [fillFiledMessage, setFillFiledMessage] = useState(false)
  const [{ username, threshold }, setFields] = useState(
    () => createFields
  )

  const [visibleAuthModal, setVisibleAuthModal] = useState(false)

  const [isGenerateClicked, setIsGenerateClicked] = useState(false)

  const [smallPubKey, setSmallPubKey] = useState(() => [...Array(40)].map(() => Math.random().toString(36)[2]).join(''))
  const [largePubKey, setLargePubKey] = useState(() => [...Array(40)].map(() => Math.random().toString(36)[2]).join(''))

  const [visiblePreview, setVisiblePreview] = useState(false)

  useEffect(() => {
    let isMounted = true

    if (isGenerateClicked) {
      setVisibleAuthModal(true)
    }

    return () => {
      isMounted = false
    }
  }, [isGenerateClicked])

  const handleUploadFile = async uploadFile => {
    const formData = new FormData()
    formData.append('file', uploadFile)

    const uploadResult = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const mediaData = await uploadResult.json()
    await setUploadMedia(mediaData?.['media'])
  }

  const handleOAuth = useCallback(
    async user => {
      !cosmicUser.hasOwnProperty('id') && setVisibleAuthModal(true)

      if (!user && !user?.hasOwnProperty('id')) return
      user && uploadFile && (await handleUploadFile(uploadFile))
    },
    [cosmicUser, uploadFile]
  )

  const handleUpload = async e => {
    setUploadFile(e.target.files[0])

    cosmicUser?.hasOwnProperty('id')
      ? handleUploadFile(e.target.files[0])
      : handleOAuth()
  }

  const handleChange = ({ target: { name, value } }) =>
    setFields(prevFields => ({
      ...prevFields,
      [name]: value,
    }))

  const handleChooseCategory = useCallback(index => {
    setChooseCategory(index)
  }, [])

  return (
    <Layout navigationPaths={navigationItems[0]?.metadata || navigation}>
      <PageMeta
        title={'Create Item | uNFT Marketplace'}
        description={
          'uNFT Marketplace built with Cosmic CMS, Next.js, and the Stripe API'
        }
      />
      <div className={cn('section', styles.section)}>
        <div className={cn('container', styles.container)}>
          <div className={styles.wrapper}>
            <div className={styles.head}>
              <div className={cn('h2', styles.title)}>
                Create your account 
              </div>
            </div>
            <form className={styles.form} action="" onClick={(e) => e.preventDefault()}>
              <div className={styles.list}>
                <div className={styles.item}>
                  <div className={styles.category}>User Details</div>
                  <div className={styles.fieldset}>
                    <TextInput
                      className={styles.field}
                      label="Username"
                      name="username"
                      type="text"
                      placeholder="e. g. Bishop"
                      onChange={handleChange}
                      value={username}
                      required
                    />
                    <TextInput
                      className={styles.field}
                      label="Threshold"
                      name="threshold"
                      type="number"
                      placeholder="e. g. 40,000"
                      onChange={handleChange}
                      value={threshold}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className={styles.foot}>
                <button
                  className={cn('button', styles.button)}
                  onClick={() => setIsGenerateClicked(true)}
                >
                  <span>Generate Mnemonic</span>
                  <Icon name="arrow-next" size="10" />
                </button>
              </div>
            </form>
          </div>
          <Preview
            className={cn(styles.preview, { [styles.active]: visiblePreview })}
            //info={{ title, color, count, description, price }}
            image={uploadMedia?.['imgix_url']}
            onClose={() => setVisiblePreview(false)}
          />
        </div>
      </div>
      <Modal
        visible={visibleAuthModal}
        disable={!cosmicUser?.hasOwnProperty('id')}
        onClose={() => setVisibleAuthModal(false)}
      >
        <OAuth
          className={styles.steps}
          handleOAuth={handleOAuth}
          handleClose={() => setVisibleAuthModal(false)}
          disable={!cosmicUser?.hasOwnProperty('id')}
          setIsGenerateClicked={setIsGenerateClicked}
          smallPubKey={smallPubKey}
          largePubKey={largePubKey}
        />
      </Modal>
    </Layout>
  )
}

export default Upload

export async function getServerSideProps() {
  const navigationItems = (await getAllDataByType('navigation')) || []
  const categoryTypes = (await getAllDataByType('categories')) || []

  const categoriesType = categoryTypes?.reduce((arr, { title, id }) => {
    return { ...arr, [id]: title }
  }, {})

  return {
    props: { navigationItems, categoriesType },
  }
}
