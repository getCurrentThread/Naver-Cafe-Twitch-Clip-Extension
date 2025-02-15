// document ready
$(document).ready(function(){
    // init the settings page on input value.
    (async () => {
        //get NCTCLM settings
        let settings = await NCTCLM.loadSettings();
        
        // set value of input
        Object.keys(settings).forEach(function(key){
            const $input = $('input[name='+key+']');
            if($input.length == 0) return;
            // check if the input is checkbox
            if($input.is(':checkbox')){
                $input.prop('checked',settings[key]);
            }else if( $input.is(':radio')){
                $input.filter('[value='+settings[key]+']').prop('checked',true);
            }
            else{
                $input.val(settings[key]);
            }
        
            // add event listener to input
            $input.change(function(){
                const $this = $(this);
                if($this.is(':checkbox'))
                    settings[key] = this.checked
                else if($this.is('[type=number]'))
                    settings[key] = Number($this.val());
                else
                    settings[key] = $this.val();
                //save settings
                NCTCLM.setValue(key, settings[key]);
            });

            // if attribute 'toggle' name input is toggle self enable/disable input
            const toggle = $input.attr('toggle')?.split(':');
            if(toggle){
                const [tkey , tvalue] = toggle;
                const $enable_input = $(`input[name=${tkey}]`);
                const fn = function(){
                    const $this = $(this);
                    if($this.is(':checkbox'))
                        $input.prop('disabled', !$this.prop('checked'));
                    else 
                        $input.prop('disabled', !($this.val() == tvalue));
                }
                // add event listener
                $enable_input.change(fn);
                fn.call($enable_input);
            }
        });

        // hidden infrequently used settings
        if(settings.hideInfrequentlyFeature){
            $("li[infrequent]").hide();
        }else{
            $("li[infrequent]").show();
        }
        
        return;
    })();

    // number input type limit to min~max
    $('input[type="number"]').on('change paste', function () {
        if (this.min) this.value = Math.max(Number(this.min), Number(this.value) || 0);
        if (this.max) this.value = Math.min(Number(this.max), Number(this.value) || 0);
    });

    // hidden infrequently used settings
    $('input[name="hideInfrequentlyFeature"]').on('change', function(){
        if(this.checked){
            $("li[infrequent]").slideUp(1000);
        }else{
            $("li[infrequent]").slideDown(1000);
        }
    });

    // if click on reset button, reset settings
    $('#reset').click(function(){
        const settings = NCTCLM.reset();
         // set value of input
        Object.keys(settings).forEach(function(key){
            const $input = $('input[name='+key+']');
            if($input.length == 0) return;
            // check if the input is checkbox
            if($input.is(':checkbox')){
                $input.prop('checked',settings[key]);
            }else if($input.is(':radio')){
                $input.filter('[value='+settings[key]+']').prop('checked',true);
            }
            else{
                $input.val(settings[key]);
            }
            const toggle = $input.attr('toggle')?.split(':');
            if(toggle){
                const [tkey , tvalue] = toggle;
                const $enable_input = $(`input[name=${tkey}]`);
                const fn = function(){
                    const $this = $(this);
                    if($this.is(':checkbox'))
                        $input.prop('disabled', !$this.prop('checked'));
                    else 
                        $input.prop('disabled', !($this.val() == tvalue));
                }
            }
        });
    });
});