'use babel'

import React, { Component } from 'react'
import PropTypes from 'prop-types'

const resourceTypes = ['Pictures', 'Audios', 'Videos']
const searchTypes = ['Filename', 'Text', 'ID']

export default class Filter extends Component {
  static propTypes = {
    sources: PropTypes.arrayOf(PropTypes.string).isRequired,
    focus: PropTypes.bool.isRequired,
    onSearch: PropTypes.func.isRequired,
  }

  state = {
    resourceType: resourceTypes[0],
    source: 'All',
    searchType: searchTypes[0],
    search: '',
    showSourcesDropdown: false,
  }

  handleResourceTypeChange = (e) => {
    const { value } = e.target
    const changed = value === "Audios" ? 'Text' : searchTypes[0]

    this.setState({
      resourceType: value,
      searchType: changed,
      showSourcesDropdown: false
    })
  }

  handleSourceClick = () => {
    const { showSourcesDropdown } = this.state
    this.setState({ showSourcesDropdown: !showSourcesDropdown })
  }

  handleSourceChange = (e) => {
    const { resourceType, searchType, search } = this.state
    const value = e.target.innerHTML
    if (search) {
      this.props.onSearch({ resourceType, searchType, source: value, search })
    }

    this.setState({ source: value, showSourcesDropdown: false })
  }

  handleInputChange = e => {
    this.setState({ search: e.target.value })
  }

  handleSearchTypeChange = (e) => {
    this.setState({ searchType: e.target.value, showSourcesDropdown: false })
  }

  handleSearch = () => {
    const { resourceType, searchType, source, search } = this.state
    if (!search) {
      return false
    }

    this.props.onSearch({ resourceType, searchType, source, search })
  }

  handleKeyDown = e => {
    if (e.keyCode === 13) {
      this.handleSearch()
    }
  }

  componentDidMount() {
    this.input.addEventListener('keydown', this.handleKeyDown)
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.focus && this.props.focus) {
      this.input.focus()
    }
  }

  componentWillUnmount() {
    this.input.removeEventListener('keydown', this.handleKeyDown)
  }

  render() {
    const { sources } = this.props
    const {
      resourceType,
      source,
      searchType,
      search,
      showSourcesDropdown
    } = this.state

    return (
      <div>
        <div className="search-radios">
          <div className="search-resources">
            {resourceTypes.map(item =>
              <label key={item}>
                <input
                  type="radio"
                  name="resourceType"
                  value={item}
                  checked={item === resourceType}
                  onChange={this.handleResourceTypeChange}
                /> {item}
              </label>
            )}
          </div>
          <div className="search-types">
            {searchTypes.map(item => {
              if (
                (resourceType === "Pictures" && item === "Text") ||
                (resourceType === "Audios" && item === "Filename")
              ) {
                return null
              }

              return (
                <label key={item}>
                  <input
                    type="radio"
                    name="searchType"
                    value={item}
                    checked={item === searchType}
                    onChange={this.handleSearchTypeChange}
                  /> {item}
                </label>
              )
            })}
          </div>
        </div>
        <div className="search-input">
          <div
            className={`search-input-sources ${searchType !== 'ID' && 'show'}`}
          >
            <p onClick={this.handleSourceClick}>{source}</p>
            <ul className={showSourcesDropdown ? 'show' : ''}>
              {sources.map(item => (
                <li
                  key={item}
                  className={item === source ? 'active' : ''}
                  onClick={this.handleSourceChange}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <input
            ref={input => this.input = input}
            className="native-key-bindings"
            type="text"
            placeholder="Search"
            tabIndex="1"
            value={search}
            onChange={this.handleInputChange}
          />
          <i onClick={this.handleSearch}></i>
        </div>
      </div>
    )
  }
}
