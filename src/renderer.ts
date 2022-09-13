class SeekrGui {
  static readonly Controls = class {
    static readonly DictionarySelector = '#dictionary'
    static readonly ExpandWordsCheckbox = '#expand-words-checkbox'
    static readonly InterestingDomainsSelector = '#interesting-domains'
    static readonly Results = '#results'
    static readonly ToggleSeekrButton = '#toggle-seekr-button'
    static readonly ViewResultsButton = '#view-results-button'
  }

  static readonly Events = class {
    static readonly Change = 'change'
    static readonly DOMContentLoaded = 'DOMContentLoaded'
    static readonly Click = 'click'
  }

  static readonly Text = class {
    static readonly LineFeed = '\r\n'
    static readonly Start = 'Start'
    static readonly Stop = 'Stop'
  }
}

const setExpandedWords = async (isExpanded: boolean) => {
  await window.seekr.toggleExpandedWords(isExpanded)
}

const loadExpandedWordsList = async () => {
  await window.seekr.backUpWords()
  const words = await window.seekr.getExpandedWords()
  const dictionaryElement = document.querySelector(
    SeekrGui.Controls.DictionarySelector
  )

  if (dictionaryElement) {
    dictionaryElement.innerHTML = words.join('\r\n')
  }
}

const loadDictionary = async () => {
  const dictionaryElement = document.querySelector(
    SeekrGui.Controls.DictionarySelector
  )

  if (dictionaryElement) {
    const words = await window.seekr.getWords()
    dictionaryElement.innerHTML = words.join('\r\n')
  }
}

const loadInterestingDomains = async () => {
  const interestingDomainsElement = document.querySelector(
    SeekrGui.Controls.InterestingDomainsSelector
  )

  if (interestingDomainsElement) {
    const interestingDomains = await window.seekr.getInterestingDomains()
    interestingDomainsElement.innerHTML = interestingDomains.join('\r\n')
  }
}

document.addEventListener(SeekrGui.Events.DOMContentLoaded, async () => {
  await loadDictionary()

  await loadInterestingDomains()

  window.seekr.reportResults((results: any) => {
    const resultsElement = document.querySelector(SeekrGui.Controls.Results)

    if (resultsElement) {
      resultsElement.innerHTML = resultsElement.innerHTML + results
    }
  })

  document
    .querySelector(SeekrGui.Controls.ToggleSeekrButton)
    ?.addEventListener(SeekrGui.Events.Click, async (event) => {
      const running = await window.seekr.toggleRunningState()
      const toggleButton = event.target as HTMLButtonElement
      toggleButton.textContent = running
        ? SeekrGui.Text.Stop
        : SeekrGui.Text.Start
    })

  document
    .querySelector(SeekrGui.Controls.ViewResultsButton)
    ?.addEventListener(SeekrGui.Events.Click, async () => {
      const results = await window.seekr.getReportResults()
      const resultsElement = document.querySelector(SeekrGui.Controls.Results)

      if (resultsElement) {
        resultsElement.innerHTML = results
      }
    })

  document
    .querySelector(SeekrGui.Controls.ExpandWordsCheckbox)
    ?.addEventListener(SeekrGui.Events.Change, async (event: Event) => {
      const target = event.target as HTMLInputElement

      if (target.checked) {
        await setExpandedWords(true)
        await loadExpandedWordsList()
      } else {
        await setExpandedWords(false)
        await window.seekr.restoreWords()
        await loadDictionary()
      }
    })

  document
    .querySelector(SeekrGui.Controls.DictionarySelector)
    ?.addEventListener(SeekrGui.Events.Change, async (event: Event) => {
      const target = event.target as HTMLInputElement
      const words = target.value.split(SeekrGui.Text.LineFeed)
      await window.seekr.setWords(words)
    })

  document
    .querySelector(SeekrGui.Controls.InterestingDomainsSelector)
    ?.addEventListener(SeekrGui.Events.Change, async (event: Event) => {
      const target = event.target as HTMLInputElement
      const interestingDomains = target.value.split(SeekrGui.Text.LineFeed)
      await window.seekr.setInterestingDomains(interestingDomains)
    })
})
