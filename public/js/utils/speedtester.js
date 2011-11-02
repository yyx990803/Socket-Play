define(function() {
        function SpeedTester() {
            this.t = 0;
        }
        SpeedTester.prototype.start = function() {
            var d = new Date();
            this.t = d.getTime();
        }
        SpeedTester.prototype.report = function(m) {
            var d = new Date();
            var timeUsed = d.getTime()-this.t;
            var msg = 'Time used: '+timeUsed+'ms';
            if (m) msg += ' ('+m+')';
            console.log(msg);
            return timeUsed;
        }
        return new SpeedTester();
});