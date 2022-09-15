class SeekrGui {
  static readonly Controls = class {
    static readonly DictionarySelector = '#dictionary'
    static readonly ExpandWordsCheckbox = '#expand-words-checkbox'
    static readonly InterestingDomainsSelector = '#interesting-domains'
    static readonly Results = '#results'
    static readonly SaveWordsButton = '#save-words-button'
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
  ) as HTMLTextAreaElement

  if (dictionaryElement) {
    dictionaryElement.value = words.join('\r\n')
  }
}

const loadDictionary = async () => {
  console.log('LOADING DICTIONARY')
  const dictionaryElement = document.querySelector(
    SeekrGui.Controls.DictionarySelector
  ) as HTMLTextAreaElement

  if (dictionaryElement) {
    const words = await window.seekr.getWords()
    console.log('loadDictionary! WORDS: ', words)
    dictionaryElement.value = words.join('\r\n')
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

  window.seekr.reportResults((_event: any, result: any) => {
    const resultsElement = document.querySelector(
      SeekrGui.Controls.Results
    ) as HTMLTextAreaElement

    if (result.found && result.matches.length > 0) {
      resultsElement.value =
        resultsElement.value +
        `${result.url} ${result.matches.join(', ')}` +
        '\r\n'
    }
    if (result.startsWith('Processed')) {
      const regex =
        /Processed (?<totalProcessed>\d+) pages in (?<totalTime>\d+\.\d+) s. Percent complete: (?<percentComplete>\d+\.\d+). Total urls in queue: (?<remaining>\d+), total added: (?<added>\d+)/

      const matches = result.match(regex)

      const totalProcessedElement = document.querySelector(
        '#total-processed'
      ) as HTMLSpanElement

      if (totalProcessedElement) {
        totalProcessedElement.innerText = `Total Processed: ${matches?.groups?.totalProcessed}`
      }

      const totalTimeElement = document.querySelector(
        '#total-time'
      ) as HTMLSpanElement

      if (totalTimeElement) {
        totalTimeElement.innerText = `Total Time: ${matches?.groups?.totalTime} s`
      }

      const percentCompleteElement = document.querySelector(
        '#percent-complete'
      ) as HTMLSpanElement

      if (percentCompleteElement) {
        percentCompleteElement.innerText = `Percent Complete: ${matches?.groups?.percentComplete} %`
      }

      const remainingElement = document.querySelector(
        '#remaining'
      ) as HTMLSpanElement

      if (remainingElement) {
        remainingElement.innerText = `Remaining: ${matches?.groups?.remaining}`
      }

      const addedElement = document.querySelector('#added') as HTMLSpanElement

      if (addedElement) {
        addedElement.innerText = `Total: ${matches?.groups?.added}`
      }
    }
  })

  document
    .querySelector(SeekrGui.Controls.ToggleSeekrButton)
    ?.addEventListener(SeekrGui.Events.Click, async (event) => {
      const toggleButton = event.target as HTMLButtonElement
      toggleButton.textContent =
        toggleButton.textContent == SeekrGui.Text.Stop
          ? SeekrGui.Text.Start
          : SeekrGui.Text.Stop

      await window.seekr.toggleRunningState()
    })

  document
    .querySelector(SeekrGui.Controls.SaveWordsButton)
    ?.addEventListener(SeekrGui.Events.Click, async () => {
      await window.seekr.saveWords()
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
        console.log('RESTORED WORDS')
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
