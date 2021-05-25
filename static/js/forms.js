// This script requires jQuery and jquery-form plugin
// You can use these ones from Cloudflare CDN:

$('.form-group').each(function () {
    let $formgroup = $(this);
    let $checkboxes = $formgroup.find('input[type="checkbox"]:required');
    if ($checkboxes.size() > 0) {
        $checkboxes.change(function () {
            if ($formgroup.find('input[type="checkbox"]:checked').size() > 0) {
                $checkboxes.attr('required', false)
            } else {
                $checkboxes.attr('required', true)
            }
        })
    }
});

$('#bootstrapForm').submit(function (event) {
    event.preventDefault()
    var extraData = {}
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