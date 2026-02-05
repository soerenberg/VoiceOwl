# Execution Plan

## General project configurations

- The project should be a static web application.
- The primary objective of the web app is to analyze voice recordings primarily regarding pitch.
- The web app is static, i.e., there should be no backend at all involved.
- The web app should use the React framework.

## Functional Description of the App

### Function: Upload existing voice recording

- The app should offer the user to upload an existing recording from disk.
- Here, 'upload' of course does not mean 'upload to the backend' since no backend must exist, but rather 'send to the app to analyze'.
- At least the following file formats should be supported: wav, m4a.
- It should be possible to drag & drop existing files into a clearly marked drop zone, or to use a file browser pop up to select the file from disk.

### Function: Record new voice recording

- The app should also offer the functionality to instead record a voice recording on the fly.
- During voice reco TODO

### Function: Download voice recording

- The app should offer the functionality to download the recording that is being analyzed.
- At least the following file formats should be supported: wav, m4a.

### Function: Pitch Analysis

The main purpose of the app is analyzing the voice (e.g. speaking or singing) pitch of the selected recording.

#### Pitch Graph

- The main panel should show a multi-line line plot of the pitch.
- A single line should display the graph for <GRAPH_LINE_WIDTH> (default 30s) of the recording.
- Each line should show the pitch in Hertz.
- The graph should be a line plot so that a continous line is plotted (unless silence occurs).
- If <GRAPH_MARKERS> (default False) is set to True a single measurement should additionally be plotted with a marker (rectangle).
- Each line of the graph should display y-ticks at the very left, where ticks should be displayed for each multiple of  <GRAPH_TICK_GAP> (default 50 Hertz).
- Each line should vertically cover <GRAPH_LOWER> (default 100 Hertz) to <GRAPH_UPPER> (default 300 Hertz).
- At the height of each said tick a horizontal slightly transparent line should extend towards the very far right of plot.
- Each line should be <GRAPH_LINE_HEIGHT> (default 50px) tall.
- If <GRAPH_SHOW_1_SEC_AVG> (default False) is set to True, there should be moving average with 1 second window be plotted additionally. It should be plotted in a slightly lighter shade and in a dashed line.
- If <GRAPH_SHOW_3_SEC_AVG> (default False) is set to True, there should be moving average with 3 second window be plotted additionally. It should be plotted in a slightly lighter shade and in a dashed and dotted line.
- If <GRAPH_SHOW_10_SEC_AVG> (default False) is set to True, there should be moving average with 10 second window be plotted additionally. It should be plotted in a slightly lighter shade and in a dotted line.
- If <PITCH_LOWER_BOUND> (default None) to a specified Hertz number the area in each line under said threshold should be shaded red (use Catpuccin theme).
- If <PITCH_UPPER_BOUND> (default None) to a specified Hertz number the area in each line above said threshold should be shaded red (use Catpuccin theme).
- The remaining area of each line should be shade greed (use Catpuccin theme).

#### Replay Recording

- At bottom of the web app should be some minimalistic control buttons to play and pause the selected recording.
- If the recording is being replayed a vertical line/cursor should trace the current position through the previously discussed pitch graphs.
- The pitch graph should allow the user to click on a position and set the cursor to this position, either during being in pause or while replaying.

#### Display of Recording Statistics 

At the very bottom of the app below the replay controls should be several statistics displayed:

- Overall duration of the recording in seconds.
- Average pitch in Hertz
- Minimum pitch in Hertz
- 5th quantile of pitch in Hertz
- 10th quantile of pitch in Hertz
- 25th quantile of pitch in Hertz
- Median pitch in Hertz
- 75th quantile of pitch in Hertz
- 90th quantile of pitch in Hertz
- 95th quantile of pitch in Hertz
- Maximum pitch in Hertz

For all the statistics made in Hertz mentioned above:
* <PITCH_LOWER_BOUND> is unset and <PITCH_UPPER_BOUND> is unset, display the statistics in a neutral, clear text color.
* <PITCH_LOWER_BOUND> is set and <PITCH_UPPER_BOUND> is unset, display the statistic red if below <PITCH_LOWER_BOUND> and green otherwise (use Catpuccin colors).
* <PITCH_LOWER_BOUND> is unset and <PITCH_UPPER_BOUND> is set, display the statistic red if above <PITCH_UPPER_BOUND> and green otherwise (use Catpuccin colors).
* <PITCH_LOWER_BOUND> is set and <PITCH_UPPER_BOUND> is set, display the statistic green if between <PITCH_LOWER_BOUND> and <PITCH_UPPER_BOUND>, and green otherwise (use Catpuccin colors).


### Function: Side Menu

The app should have a side menu that slides in from the left via a 'tool' (symbol) button in the bottom left.

The side menu should offer the following settings. Use the mentioned subsection as subsection is the menu as well.

#### Graph
- "Precision" <PRECISION> allow selection of integer milliseconds (default to 100ms or something that is appropriate). This parameter should control the precision of the measurements being made. For instance, if this is 100ms then one pitch measurement should be inferred from the recording every 100ms and thus being plotted.
- "Line Width" <GRAPH_LINE_WIDTH> allow selections of 5, 15, 30, 45, 60 seconds.
- "Show Markers" <GRAPH_MARKERS> allow selections False, True.
- "Tick Gap" <GRAPH_TICK_GAP> allow selections 10, 20, 25, 50 Hertz.
- "Height" <GRAPH_LINE_HEIGHT> allow selections 10px, 20px, 50px, 70px, 100px.
- "Lower" <GRAPH_LOWER> allow selections of integer Hertz numbers from 1 to 300 Hertz.
- "Upper" <GRAPH_UPPER> allow selections of integer Hertz numbers from <GRAPH_LOWER> to 500 Hertz.

#### Pitch
- "Lower Bound" <PITCH_LOWER_BOUND> allow selections 'None, or integer Hertz numbers from 1 to 300 Hertz.
- "Upper Bound" <PITCH_UPPER_BOUND> allow selections 'None, or integer Hertz numbers from 1 (or <PITCH_LOWER_BOUND> if its set to 300 Hertz.


## Design and Aesthetic choices

- The webapp should use the Catpuccin Mocha color scheme throughout.
- The webapp should use bootstrap and react-bootstrap for design elements.
- The webapp should be minimalistic, clean, lean and functional first.
- Ideally, a coding associated font should be used throughout to give the app a friendly and nerdy feel.
- Where possible iconographics and symbols should be used. For instance, instead of using a button with the word 'download' or 'record' an appropriate symbol should be used instead to keep the app as clean as possible.
