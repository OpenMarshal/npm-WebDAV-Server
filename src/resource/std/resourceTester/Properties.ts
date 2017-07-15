import { ResourceTesterTestCallback } from './Types'
import { XML } from 'xml-js-builder'

// ****************************** Properties ****************************** //
export function setProperty(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 2);
    
    this.producer(false, (r1) => {
        const name = 'prop-test_test:test//test/test.test';
        const value = 'value value.value_value<value>___</value>';

        r1.setProperty(name, value, (e) => {
            callback(e, !e, 'setProperty error', undefined, () => {
                r1.getProperty(name, (e, v) => {
                    callback(e, v === value, 'Value returned by getProperty is different of the value provided to setProperty')
                })
            })
        })
    })
    
    this.producer(false, (r1) => {
        const name = 'prop-test_test:test//test/test.test';
        const value = XML.parse('<actors><actor>Titi</actor><actor>Toto</actor></actors>');

        r1.setProperty(name, value, (e) => {
            callback(e, !e, 'setProperty error', undefined, () => {
                r1.getProperty(name, (e, v) => {
                    callback(e, v === value, 'Value returned by getProperty is different of the value provided to setProperty')
                })
            })
        })
    })
}
export function removeProperty(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 1);

    this.producer(false, (r1) => {
        const name = 'prop-test_test:test//test/test.test';
        const value = 'value';

        r1.setProperty(name, value, (e) => {
            callback(e, !e, 'setProperty error', undefined, () => {
                r1.removeProperty(name, (e) => {
                    callback(e, !e, 'removeProperty error', undefined, () => {
                        r1.getProperty(name, (e, v) => {
                            callback(e, !e && !!v, 'The property has not been removed from removeProperty', false)
                        })
                    })
                })
            })
        })
    })
}
export function getProperties(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 1);
    
    this.producer(false, (r1) => {
        const values = {
            'prop-test_test:test//test/test.test': 'value',
            'test2': 'value2',
            'value': 'value3',
        }
        const keys = Object.keys(values);

        r1.setProperty(keys[0], values[keys[0]], (e) => {
        callback(e, !e, 'setProperty error', undefined, () => {
        r1.setProperty(keys[1], values[keys[1]], (e) => {
        callback(e, !e, 'setProperty error', undefined, () => {
        r1.setProperty(keys[2], values[keys[2]], (e) => {
        callback(e, !e, 'setProperty error', undefined, () => {
            r1.getProperties((e, props) => {
            callback(e, !e && !!props, 'getProperties error', undefined, () => {
                const valid = {};
                for(const key of keys)
                    valid[key] = false;
                
                for(const name of Object.keys(props))
                    if(values[name] !== undefined)
                        valid[name] = values[name] === props[name];
                
                callback(null, keys.every((k) => valid[k]), 'One or many properties are invalid or missing in the response of getProperties')
            })
            })
        })
        })
        })
        })
        })
        })
    })
}
