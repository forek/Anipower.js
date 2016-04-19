require.config({
    baseUrl: 'lib'
});

require(["anipower"], function(Anp) {
    var flexImg = {
        style: {
            'z-index': 1,
            'opacity': '0&300'
        },
        status: [{
            name: 'active',
            style: {
                'z-index': 2,
                'opacity': 1
            }
        }]
    }

    var flexControl = {
        style: {
            color: '#8c8c8c'
        },
        status: [{
            name: 'active',
            style: {
                color: '#e6551d'
            }
        }],
        trigger: {
            click: function() {
                this.props.$top.toggle('stop');
                this.props.data.no = this.childNum;
            }
        }
    }

    var flexC = {
        style: {
            opacity: '0&300'
        },
        status: [{
            name: 'active',
            style: {
                opacity: '0.3'
            },
            trigger: {
                click: function() {
                    this.props.$top.toggle('stop');
                    if (this.childNum == 0) {
                        this.props.data.no = this.props.data.no == 0 ? 5 : this.props.data.no - 1;
                    } else if (this.childNum == 1) {
                        this.props.data.no = this.props.data.no == 5 ? 0 : this.props.data.no + 1;
                    }
                }
            }
        }]
    }

    flexslider = new Anp.create({
        template: {
            flexImg: flexImg,
            flexControl: flexControl,
            flexC: flexC
        },
        data: {
            no: 0
        },
        watcher: {
            no: function(value, oldvalue) {
                if (oldvalue >= 0) {
                    this.props.children.flexImg[oldvalue].toggle('init');
                    this.props.children.flexControl[oldvalue].toggle('init',100);
                }
                this.props.children.flexImg[value].toggle('active');
                this.props.children.flexControl[value].toggle('active',100);
            }
        },
        status: [{
            name: 'stop'
        }],
        trigger: {
            mouseover: function() {
                this.props.children.flexC[0].toggle('active');
                this.props.children.flexC[1].toggle('active');
            },
            mouseout: function() {
                this.props.children.flexC[0].toggle('init');
                this.props.children.flexC[1].toggle('init');
            }
        },
        eventAlive: true,
        running: function() {
            var self = this;
            return setInterval(function() {
                if (self.props.data.no === 5) {
                    self.props.data.no = 0;
                } else {
                    self.props.data.no++;
                }
            }, 3000);
        }
    }, Anp.$('#flexslider'));

    window.flexslider = flexslider;

});