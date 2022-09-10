document.addEventListener('DOMContentLoaded', async () => {
  const words = await window.seekr.getWords()
  const dictionaryElement = document.querySelector('#dictionary')

  if (dictionaryElement) {
    dictionaryElement.innerHTML = words.join('\r\n')
  }

  const interestingDomains = await window.seekr.getInterestingDomains()
  const interestingDomainsElement = document.querySelector(
    '#interesting-domains'
  )

  if (interestingDomainsElement) {
    interestingDomainsElement.innerHTML = interestingDomains.join('\r\n')
  }

  const toggleButton = document.querySelector('#toggle-seekr-button')

  if (toggleButton) {
    toggleButton.addEventListener('click', async () => {
      const running = await window.seekr.toggleRunningState()
      toggleButton.textContent = running ? 'Stop' : 'Start'
    })
  }
})
