export class SeekrGui {
  static readonly FileNames = class {
    static readonly Dictionary = 'dictionary.txt'
    static readonly InterestingDomains = 'interesting_domains.txt'
  }

  static readonly Keys = class {
    static readonly Channels = class {
      static readonly AddImage = 'add-image'
      static readonly BackUpWords = 'back-up-words'
      static readonly GetCompletionStats = 'get-completion-stats'
      static readonly GetWords = 'get-words'
      static readonly GetExpandedWords = 'get-expanded-words'
      static readonly GetImagePaths = 'get-image-paths'
      static readonly GetImages = 'get-images'
      static readonly GetInterestingDomains = 'get-interesting-domains'
      static readonly GetReportResults = 'get-report-results'
      static readonly ReportResults = 'report-results'
      static readonly RestoreWords = 'restore-words'
      static readonly SetWords = 'set-words'
      static readonly SaveWords = 'save-words'
      static readonly SetInterestingDomains = 'set-interesting-domains'
      static readonly ToggleExpandedWords = 'toggle-expanded-words'
      static readonly ToggleRunningState = 'toggle-running-state'
    }

    static readonly State = class {
      static readonly BackupWords = 'seekr.state.backupWords'
      static readonly ExpandedWords = 'seekr.state.expandedWords'
      static readonly ImagePaths = 'seekr.state.imagePaths'
      static readonly InterestingDomains = 'seekr.state.interestingDomains'
      static readonly ReportResults = 'seekr.state.reportResults'
      static readonly Running = 'seekr.state.running'
      static readonly Words = 'seekr.state.words'
      static readonly UseExpandedWords = 'seekr.state.useExpandedWords'
    }
  }

  static readonly Window = class {
    static readonly Height = 766
    static readonly Width = 1260

    static readonly DebugHeight = 766
    static readonly DebugWidth = 2000
  }
}
