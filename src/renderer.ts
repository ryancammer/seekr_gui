class SeekrGui {
  static readonly Controls = class {
    static readonly DictionarySelector = '#dictionary'
    static readonly ExpandWordsCheckbox = '#expand-words-checkbox'
    static readonly InterestingDomainsSelector = '#interesting-domains'
    static readonly ProgressBar = '#progress-bar'
    static readonly Results = '#results'
    static readonly SaveWordsButton = '#save-words-button'
    static readonly ToggleSeekrButton = '#toggle-seekr-button'
    static readonly ViewResultsButton = '#view-results-button'
    static readonly Screenshots = '#screenshots'
  }

  static readonly Events = class {
    static readonly Change = 'change'
    static readonly DOMContentLoaded = 'DOMContentLoaded'
    static readonly Click = 'click'
  }

  static readonly ScreenShots = class {
    static readonly ImageHeight = 135
    static readonly ImageWidth = 180
  }

  static readonly Text = class {
    static readonly LineFeed = '\r\n'
    static readonly Start = 'Start'
    static readonly Stop = 'Stop'
  }
}

let completionStatsInterval: any = null

const setCompletionStats = async () => {
  const completionStats = await window.seekr.getCompletionStats()

  const totalProcessedElement = document.querySelector(
    '#total-processed'
  ) as HTMLSpanElement

  if (totalProcessedElement) {
    totalProcessedElement.innerText = `Total Processed: ${completionStats.canistersProcessed}`
  }

  const totalTimeElement = document.querySelector(
    '#total-time'
  ) as HTMLSpanElement

  if (totalTimeElement) {
    totalTimeElement.innerText = `Total Time: ${completionStats.totalTime} s`
  }

  const percentCompleteElement = document.querySelector(
    '#percent-complete'
  ) as HTMLSpanElement

  if (percentCompleteElement) {
    percentCompleteElement.innerText = `Percent Complete: ${completionStats.percentComplete} %`
  }

  const remainingElement = document.querySelector(
    '#remaining'
  ) as HTMLSpanElement

  if (remainingElement) {
    remainingElement.innerText = `Remaining: ${
      completionStats.totalNumberOfCanisters -
      completionStats.canistersProcessed
    }`
  }

  const progressBarElement = document.querySelector(
    SeekrGui.Controls.ProgressBar
  ) as HTMLDivElement

  if (progressBarElement) {
    progressBarElement.style.width = `${completionStats.percentComplete}%`
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
  const dictionaryElement = document.querySelector(
    SeekrGui.Controls.DictionarySelector
  ) as HTMLTextAreaElement

  if (dictionaryElement) {
    const words = await window.seekr.getWords()
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
  const imageModal = document.getElementById('image-modal')
  imageModal?.addEventListener('show.bs.modal', (event) => {
    // @ts-ignore
    const button = event.relatedTarget
    const source = button.getAttribute('data-bs-source')
    const imageModal = document.getElementById(
      'image-modal-image'
    ) as HTMLImageElement
    imageModal.src = source
  })

  await loadDictionary()

  await loadInterestingDomains()

  window.seekr.reportResults(async (_event: any, result: any) => {
    console.log(result)
    const resultsElement = document.querySelector(
      SeekrGui.Controls.Results
    ) as HTMLTextAreaElement

    if (result.found && result.matches.length > 0) {
      resultsElement.value =
        resultsElement.value +
        `${result.url} ${result.matches.join(', ')}` +
        '\r\n'
    }

    const imagePaths = await window.seekr.getImagePaths()

    const images = await window.seekr.getImages()

    const screenshotsElement = document.querySelector(
      SeekrGui.Controls.Screenshots
    )

    const toHash = (s: string) => {
      let hash = 0

      if (s.length == 0) return hash

      for (let i = 0; i < s.length; i++) {
        const char = s.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash
      }

      return hash
    }

    for (const imagePath of imagePaths) {
      const imageId = toHash(imagePath).toString()

      if (!images.includes(imageId)) {
        const image = document.createElement('img')
        image.src = imagePath
        image.width = SeekrGui.ScreenShots.ImageWidth
        image.height = SeekrGui.ScreenShots.ImageHeight
        image.id = imageId

        const dataBsToggle = document.createAttribute('data-bs-toggle')
        dataBsToggle.value = 'modal'
        image.attributes.setNamedItem(dataBsToggle)
        const dataBsTarget = document.createAttribute('data-bs-target')
        dataBsTarget.value = '#image-modal'
        image.attributes.setNamedItem(dataBsTarget)
        const dataBsSource = document.createAttribute('data-bs-source')
        dataBsSource.value = imagePath
        image.attributes.setNamedItem(dataBsSource)
        screenshotsElement?.appendChild(image)

        await window.seekr.addImage(imageId)
      }
    }

    if (typeof result === 'string' && result.startsWith('Processed')) {
      const completionStats = await window.seekr.getCompletionStats()

      const totalProcessedElement = document.querySelector(
        '#total-processed'
      ) as HTMLSpanElement

      if (totalProcessedElement) {
        totalProcessedElement.innerText = `Total Processed: ${completionStats.canistersProcessed}`
      }

      const totalTimeElement = document.querySelector(
        '#total-time'
      ) as HTMLSpanElement

      if (totalTimeElement) {
        totalTimeElement.innerText = `Total Time: ${completionStats.totalTime} s`
      }

      const percentCompleteElement = document.querySelector(
        '#percent-complete'
      ) as HTMLSpanElement

      if (percentCompleteElement) {
        percentCompleteElement.innerText = `Percent Complete: ${completionStats.percentComplete} %`
      }

      const remainingElement = document.querySelector(
        '#remaining'
      ) as HTMLSpanElement

      if (remainingElement) {
        remainingElement.innerText = `Remaining: ${
          completionStats.totalNumberOfCanisters -
          completionStats.canistersProcessed
        }`
      }

      const progressBarElement = document.querySelector(
        SeekrGui.Controls.ProgressBar
      ) as HTMLDivElement

      if (progressBarElement) {
        progressBarElement.style.width = `${completionStats.percentComplete}%`
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

      if (completionStatsInterval == null) {
        completionStatsInterval = setInterval(async () => {
          await setCompletionStats()
        }, 2000)
      } else {
        clearInterval(completionStatsInterval)
        completionStatsInterval = null
      }

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
