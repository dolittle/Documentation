const _major = new WeakMap();
const _minor = new WeakMap();
const _patch = new WeakMap();
const _build = new WeakMap();
const _isRelease = new WeakMap();
const _preReleaseString = new WeakMap();

const versionRegex = /(\d+).(\d+).(\d+)-*([\w]+)*[+-.]*(\d+)*/g;

class BuildVersion {

    constructor(versionAsString, release) {
        _isRelease.set(this, release || false);

        let match = versionRegex.exec(versionAsString)
        if( match ) {
            _major.set(this, parseInt(match[1]));
            _minor.set(this, parseInt(match[2]));
            _patch.set(this, parseInt(match[3]));
            _preReleaseString.set(this, match[4] || '');
            _build.set(this, match[5]?parseInt(match[5]):0);
        } else {
            _major.set(this, 0);
            _minor.set(this, 0);
            _patch.set(this, 0);
            _build.set(this, 0);
            _preReleaseString.set(this,'');
        }
    }

    get major() {
        return _major.get(this);
    }

    get minor() {
        return _minor.get(this);
    }

    get patch() {
        return _patch.get(this);
    }

    get build() {
        return _build.get(this);
    }

    get preReleaseString() {
        return _preReleaseString.get(this);
    }

    get isRelease() { 
        return _isRelease.get(this);
    }

    get isPreRelease() {
        return this.preReleaseString && this.preReleaseString != '';
    }


    toString() {
        if( !this.isPreRelease ) {
            return this.isRelease?
                        `${this.major}.${this.minor}.${this.patch}`:
                        `${this.major}.${this.minor}.${this.patch}.${this.build}`
        } else {
            return `${this.major}.${this.minor}.${this.patch}-${this.preReleaseString}.${this.build}`
        }
    }
}

module.exports = BuildVersion;