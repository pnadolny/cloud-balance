System.register(['angular2/core', './hero.service'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, hero_service_1;
    var HeroDetailComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (hero_service_1_1) {
                hero_service_1 = hero_service_1_1;
            }],
        execute: function() {
            HeroDetailComponent = (function () {
                function HeroDetailComponent(_heroService) {
                    this._heroService = _heroService;
                }
                HeroDetailComponent = __decorate([
                    core_1.Component({
                        selector: 'my-hero-detail',
                        template: "\n\n    <div *ngIf=\"hero\">\n    <h2>{{hero.name}} details!</h2>\n    <div><label>id: </label>{{hero.id}}</div>\n\t    <div>\n\t      <label>name: </label>\n\t      <input [(ngModel)]=\"hero.name\" placeholder=\"name\"/>\n\t    </div>\n     </div>\n\n      ",
                        inputs: ['hero']
                    }), 
                    __metadata('design:paramtypes', [hero_service_1.HeroService])
                ], HeroDetailComponent);
                return HeroDetailComponent;
            })();
            exports_1("HeroDetailComponent", HeroDetailComponent);
        }
    }
});
//# sourceMappingURL=hero-detail.component.js.map