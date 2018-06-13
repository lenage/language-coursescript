'use babel'

import React from 'react'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'

const SearchItem = props => {
  const { data, type, onCopy } = props

  const copyButton = (
    <div className="search-item-buttons">
      <span onClick={() => handleCopy('name')}>Copy name</span>
      <span onClick={() => handleCopy('id')}>Copy id</span>
    </div>
  )

  const handleCopy = field => {
    if (field === 'name') {
      onCopy(data.origin_filename || data.text)
    } else {
      onCopy(data.resource_id)
    }
  }

  if (type === 'pics') {
    return (
      <div className="search-item pic">
        <div className="left">
          <img src={data.url} alt=""/>
        </div>
        <div className="right">
          <p>{dayjs(data.created_at_sec * 1000).format('YYYY-MM-DD HH:mm')}</p>
          <p>{data.origin_filename}</p>
          {copyButton}
        </div>
      </div>
    )
  }

  if (type === 'videos') {
    return (
      <div className="search-item video">
        <div className="left">
          <video src={data.url} controls></video>
        </div>
        <div className="right">
          <p>{dayjs(data.created_at_sec * 1000).format('YYYY-MM-DD HH:mm')}</p>
          <p>{data.origin_filename}</p>
          {copyButton}
        </div>
      </div>
    )
  }

  if (type === 'audios') {
    return (
      <div className="search-item audio">
        <p>{dayjs(data.created_at_sec * 1000).format('YYYY-MM-DD HH:mm')}</p>
        <p>{data.text}</p>
        <div className="search-item-audio">
          <audio src={data.url} controls></audio>
          {copyButton}
        </div>
      </div>
    )
  }

  return null
}

SearchItem.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    url: PropTypes.string.isRequired,
    resource_id: PropTypes.string.isRequired,
    text: PropTypes.string,
    origin_filename: PropTypes.string,
  })).isRequired,
  type: PropTypes.string.isRequired,
  onCopy: PropTypes.func.isRequired,
}

export default SearchItem
