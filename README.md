# indigo-take-home-assessment

To run the app, just open index.html in your browser.

Notes:
I took a very functional approach, trying to abstract as much out into reusable functions as possible,
and keeping all application-specific logic inside of the application state, sort of like a config.

The Javascript file does the following:
-Initialize application state to keep track of data on the client
-Append a stylesheet
-Add listeners to submit and add buttons
-Add accessibility attributes to inputs based on the rules in the prompt
-Append additional HTML to the page to help display data and error messages
-Define various methods for things like:
--converting data from the form into a formatted entry in our application state
--validating data and displaying error messages accordingly
--"submitting" the data to a fake server using a dummy asynchronous method
--rendering data on the page in both JSON format and a more user-friendly, styled format

Thanks for this opportunity and I look forward to hearing from you!

