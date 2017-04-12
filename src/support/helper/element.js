'use strict'

var context = require('../context');
var helperString = require('./string');
var helperInfo = require('./info');
var lastStyleValue = '';

var Element = {

    /**
     * Stores last style (highlight)
     */
    lastStyleElement: null,

    /**
     * Stores last container|name
     */
    lastUsedLocator: null,

    /**
     * Returns the elementFinder object to interact with in protractor
    */
    getElementFinder: function (container, name) {

        var result = this.findLocator(container, name);
        if (Object.keys(result).length !== 2) {
            throw "Locator element incorrect, please use {key, type, value}";
        }

        var type = result[0];
        var content = result[1];

        //save current used container/name
        this.lastUsedLocator = [container, name];

        switch (type.toLowerCase()) {
            /** 
             * Locators by Extended webdriver.By
             */
            case 'classname':
                return element(by.className(content));
            case 'css':
                return element(by.css(content));
            case 'id':
                return element(by.id(content));
            case 'linktext':
                return element(by.linkText(content));
            case 'js':
                return element(by.js(content));
            case 'name':
                return element(by.name(content));
            case 'partiallinktext':
                return element(by.partialLinkText(content));
            case 'tagname':
                return element(by.tagName(content));
            case 'xpath':
                return element(by.xpath(content));

            /**
             * Locators by function in ProtractorBy
             */

            case 'binding':
                return element(by.binding(content));
            case 'exactbinding':
                return element(by.exactBinding(content));
            case 'model':
                return element(by.model(content));
            case 'buttontext':
                return element(by.buttonText(content));
            case 'partialbuttontext':
                return element(by.partialButtonText(content));
            case 'repeater':
                return element(by.repeater(content));
            case 'exactrepeater':
                return element(by.exactRepeater(content));
            case 'csscontainingtext':
                return element(by.cssContainingText(content));
            case 'options':
                return element(by.options(content));
            case 'deepcss':
                return element(by.deepCss(content));

            default:
                return 'Type not found. Please see <http://www.protractortest.org/#/api?view=ProtractorBy>';
                break;
        }
    },

    /**
     * Find the locator in json by container name and locator key  
     */
    findLocator: function (container, name) {
        var container_list = context.locators.containers;
        var result = {};
        var params;

        // start time elapsed
        helperInfo.logTimeElapsed('findLocator');

        if (name.includes(':')) {
            params = this.getParams(name);
            name = name.substring(0, name.indexOf(":"));
        }

        for (var i = 0; i < container_list.length; i++) {
            var container_name = container_list[i].name;
            var loc_list = container_list[i].locators;

            if (container_name == container) {
                for (var j = 0; j < loc_list.length; j++) {
                    var key = loc_list[j].key;
                    if (key === name) {
                        var mType = loc_list[j].type;
                        var mValue = loc_list[j].value;

                        if (mType.toLowerCase().startsWith('p:')) {
                            mValue = helperString.formatString(mValue, params);
                            mType = mType.substring(mType.indexOf(":") + 1);
                        }

                        result[0] = mType;
                        result[1] = mValue;

                        helperInfo.logDebug(helperString.formatString('Current Locator --> using [{0}] value [{0}]', result));

                        break;
                    }
                }
                break;
            }
        }
        // prints the elapsed end time        
        helperInfo.logTimeElapsed('findLocator');

        return result;
    },

    /**
     * Mount the paramenters list from simple text
     */
    getParams: function (text) {
        var params;
        if (text.includes(':')) {
            params = text.substring(text.indexOf(":") + 1);
            params = params.match(/([\w+ |\u00C0-\u00FF]+)/g).toString().replace(',', '');
            params = params.split('|');
        }
        return params;
    },

    /**
     * Highlight Element
     */
    nutHighlightElement: function (elementFinder) {
        var pattern = "border: 3px solid red;";

        elementFinder.getAttribute('style').then(function getAttr(attribute) {
            var newStyle = attribute + pattern;
            if (this.lastStyleElement) {
                this.lastStyleElement.getAttribute('style').then(function getOldStyle(oldStyle) {
                    oldStyle = oldStyle.replace(pattern, '');
                    if (lastStyleValue === '') {
                        console.log('entrou aqui');
                        browser.executeScript("arguments[0].removeAttribute('style');", this.lastStyleElement);
                    } else {
                        browser.executeScript("arguments[0].setAttribute('style', '{0}');".format(oldStyle), this.lastStyleElement);
                    }
                });
            }
            browser.executeScript("arguments[0].setAttribute('style', '{0}');".format(newStyle), elementFinder);
            lastStyleValue = attribute;
            lastStyleElement = elementFinder;
        });
    }

};

module.exports = Element;
