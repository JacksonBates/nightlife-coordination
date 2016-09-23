$('form').submit(function(event) {
  event.preventDefault();
  var $form = $( this ),
    userEmail = $form.find( "input[name='userEmail']" ).val(),
    location = $form.find( "input[name='location']" ).val(),
    yelpId = $form.find( "input[name='yelpId']" ).val();
  if (userEmail !== "") {
    var subButton = $form.find( "input[type='submit']" );
    var goingNumber = +subButton.val().match(/^\d*/)[0];
    // subButton.val('RSVPing');
    var userAttends = $form.find( "input[name='userAttendingVenue']" );
    if (userAttends.val() === 'false') {
      subButton.val((goingNumber + 1) + ' Going');
      userAttends.val('true');
    } else {
      subButton.val((goingNumber - 1) + " Going");
      userAttends.val('false');
    }
    console.log('attempting to POST', {userEmail: userEmail, location: location, yelpId: yelpId});
    $.post('/process', { userEmail: userEmail, location: location, yelpId: yelpId })
    .done(function( data ) {
      console.log('done');  
    });
  } else {
    window.location.href = '/login?origin=/search?location=melbourne';
  }
})