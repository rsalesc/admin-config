export default {

    getReferencedLists(fields) {
        return this.indexByName(fields.filter(f => f.type() === 'referenced_list'));
    },

    _getRawReferences(fields){
        return fields.reduce((acc, f) => {
            if(f.type() === 'embedded_list')
                acc = acc.concat(this._getRawReferences(f.targetFields()));
            else if(f.type() === 'reference' || f.type() === 'reference_many')
                acc.push(f);
            return acc;
        }, []);
    },

    getReferences(fields, withRemoteComplete, optimized = null) {
        let references = this._getRawReferences(fields);
        if (withRemoteComplete === true) {
            references = references.filter(r => r.remoteComplete());
        } else if (withRemoteComplete === false) {
            references = references.filter(r => !r.remoteComplete());
        }
        if (optimized !== null) {
            references = references.filter(r => r.hasSingleApiCall() === optimized)
        }
        return this.indexByName(references);
    },
    getNonOptimizedReferences(fields, withRemoteComplete) {
        return this.getReferences(fields, withRemoteComplete, false);
    },
    getOptimizedReferences(fields, withRemoteComplete) {
        return this.getReferences(fields, withRemoteComplete, true);
    },
    indexByName(references) {
        return references.reduce((referencesByName, reference) => {
            referencesByName[reference.name()] = reference;
            return referencesByName;
        }, {});
    }
};
