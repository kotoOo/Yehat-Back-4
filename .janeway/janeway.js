module.exports = {
  "autocomplete" : {

      // Set to false to turn autocomplete off
      "enabled" : true,

      // The height of the autocomplete popup
      "height"  : 6
  },

  // When using janeway to start a script
  "execbin": {
      // Evaluate the files? (If false, then they are executed using `require`)
      "evaluate_files": false
  },

  // Keyboard shortcuts
  "shortcuts": {
      // Exit on "Control+c"
      "exit": ['C-q']
  },

  // Settings for the caller info (time & file info at the start of a line)
  caller_info: {

      // Maximum stack size to get
      stack_size: 6,

      // How long the filename can be before it's truncated
      max_filename_length: 10,

      // The minimum length of the info item, after which it is padded with spaces
      min_length: 25
  },

  // output is the main output screen in the middle
  "output" : {

      // Main scrollbar style
      "scrollbar": {
          "bg" : "blue"
      },

      // General output style
      "style" : {
          "bg" : "transparent",
          "fg" : "white"
      }
  },

  // when inspecting properties
  properties: {
      // See if 2 objects are alike, in order to deduplicate log line
      alike_objects  : false,

      // The format to use when showing a date
      date_format    : 'D Y-m-d H:i:s',

      // Print out getter values by default? (Or show "...")
      show_get_value : false,

      // Sort the properties alphabetically by key
      sort           : true
  },

  // String placeholders
  strings: {
      ellipsis : '…',

      // The gutters (icons used at the start of each line)
      // Using newer emojis is not recommended: the terminal library
      // used by janeway doesn't properly support them
      gutters: {
          // Fancy >
          input   : '\u276f ',

          // Fancy <
          output  : '\u276e ',

          // Skull
          error   : '\u2620 Error:',

          // Warning sign
          warning : '\u26a0 ',

          // Circled small letter i
          info    : '\u24D8 '
      }
  },

  // cli is the inputbox on the bottom
  "cli" : {
      "style" : {
          "bg" : "white",
          "fg" : "blue"
      },

      // Unselect open items on return
      "unselect_on_return": true
  },

  // the statusbar on the bottom
  "status" : {
      "enabled" : true,
      "style"   : {
          "bg": "grey",
          "fg": "white"
      }
  },

  // popups, also used by autocomplete
  "popup" : {
      "scrollbar": {
          "bg" : "green"
      },
      "border": {
          "type" : "line"
      },
      "style": {
          "bg": "blue",
          "fg": "white"
      },
      "shadow": true,
  },

  // menubar
  "menu" : {
      // This style only applies to unused parts and indicators
      "style": {
          "bg": "white"
      },
      "button": {
          "bg"    : "white",
          "fg"    : 235,
          "focus" : {
              "bg" : "red",
              "fg" : 249
          },
          "hover" : {
              "bg": "red",
              "fg": 249
          }
      }
  },

  // indicators
  "indicator": {
      "style": {
          "bg": 240,
          "fg": 231,

      }
  },

  "cli_history": {

      // Amount of lines to save
      "save"      : 100,

      // Use title in filename?
      "per_title" : true
  }
};