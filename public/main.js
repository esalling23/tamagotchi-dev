
$(function() {
  
  $('#authorize').on('click', function(e) {
    
    var data = {
      team: $(this).data('team'), 
      user: $(this).data('user'), 
      creature: $(this).data('creature')
    }
    
    window.location = "/login/" + data.creature + "/" + data.user + "/" + data.team;
    
  });
  
});