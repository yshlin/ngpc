// This script requires jQuery and jquery-form plugin
// You can use these ones from Cloudflare CDN:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.form/4.2.2/jquery.form.min.js" integrity="sha256-2Pjr1OlpZMY6qesJM68t2v39t+lMLvxwpa8QlRjJroA=" crossorigin="anonymous"></script>
//
$('#bootstrapForm').submit(function (event) {
    event.preventDefault()
    var extraData = {}
    {
        /* Parsing input date id=474594121 */
        var dateField = $("#474594121_date").val()
        var timeField = $("#474594121_time").val()
        let d = new Date(dateField)
        if (!isNaN(d.getTime())) {
            extraData["entry.474594121_year"] = d.getFullYear()
            extraData["entry.474594121_month"] = d.getMonth() + 1
            extraData["entry.474594121_day"] = d.getUTCDate()
        }
        if (timeField && timeField.split(':').length >= 2) {
            let values = timeField.split(':')
            extraData["entry.474594121_hour"] = values[0]
            extraData["entry.474594121_minute"] = values[1]
        }
    }
    $('#bootstrapForm').ajaxSubmit({
        data: extraData,
        dataType: 'jsonp',  // This won't really work. It's just to use a GET instead of a POST to allow cookies from different domain.
        error: function () {
            // Submit of form should be successful but JSONP callback will fail because Google Forms
            // does not support it, so this is handled as a failure.
            // alert('表單已送出，感謝你！')
            // You can also redirect the user to a custom thank-you page:
            window.location = 'thankyou.html'
        }
    })
})
